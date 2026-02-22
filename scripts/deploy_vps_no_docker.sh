#!/usr/bin/env bash
set -euo pipefail
SRC_DIR=$(pwd)
APP_DIR=/opt/panelvpn
ENV_DIR=/etc/panelvpn
BIN_DIR=$APP_DIR/bin
API_PORT=${API_PORT:-3001}
WEB_PORT=${WEB_PORT:-3000}
DB_USER=${DB_USER:-panel}
DB_NAME=${DB_NAME:-panelvpn}
if [ "$(id -u)" -ne 0 ]; then echo "Run as root"; exit 1; fi
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx postgresql redis-server curl git build-essential rsync
if ! command -v node >/dev/null || ! node -v | grep -q '^v18'; then curl -fsSL https://deb.nodesource.com/setup_18.x | bash - ; apt-get install -y nodejs; fi
GO_VERSION=1.21.10
if ! command -v go >/dev/null || ! go version | grep -q "go$GO_VERSION"; then
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) GOARCH=amd64 ;;
    aarch64|arm64) GOARCH=arm64 ;;
    *) echo "Unsupported arch $ARCH"; exit 1 ;;
  esac
  cd /tmp
  curl -fsSLO https://go.dev/dl/go${GO_VERSION}.linux-${GOARCH}.tar.gz
  rm -rf /usr/local/go
  tar -C /usr/local -xzf go${GO_VERSION}.linux-${GOARCH}.tar.gz
  echo 'export PATH=/usr/local/go/bin:$PATH' > /etc/profile.d/go.sh
  export PATH=/usr/local/go/bin:$PATH
fi
id -u panelvpn >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin panelvpn
mkdir -p "$APP_DIR" "$ENV_DIR" "$BIN_DIR"
rsync -a --delete --exclude .git --exclude node_modules --exclude .next "$SRC_DIR"/ "$APP_DIR"/
chown -R panelvpn:panelvpn "$APP_DIR"
systemctl enable --now postgresql
systemctl enable --now redis-server
if [ ! -f "$ENV_DIR/api.env" ]; then
  DB_PASS=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 24)
  cat > "$ENV_DIR/api.env" <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public
JWT_SECRET=${JWT_SECRET}
PORT=${API_PORT}
NODE_ENV=production
REDIS_URL=redis://127.0.0.1:6379
EOF
  chown panelvpn:panelvpn "$ENV_DIR/api.env"
  chmod 600 "$ENV_DIR/api.env"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
fi
if [ ! -f "$ENV_DIR/web.env" ]; then
  cat > "$ENV_DIR/web.env" <<EOF
NODE_ENV=production
PORT=${WEB_PORT}
NEXT_PUBLIC_API_URL=http://127.0.0.1/api
API_URL=http://127.0.0.1:${API_PORT}
EOF
  chown panelvpn:panelvpn "$ENV_DIR/web.env"
  chmod 600 "$ENV_DIR/web.env"
fi
cd "$APP_DIR"
if [ -f package-lock.json ]; then
  sudo -u panelvpn npm ci
else
  sudo -u panelvpn npm install
fi
cd "$APP_DIR/apps/api"
sudo -u panelvpn npx prisma generate
. "$ENV_DIR/api.env"
sudo -u panelvpn env DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
cd "$APP_DIR"
sudo -u panelvpn npm run build --workspaces --if-present
export PATH=/usr/local/go/bin:$PATH
cd "$APP_DIR/apps/agent"
sudo -u panelvpn /usr/local/go/bin/go build -o "$BIN_DIR/panelvpn-agent" ./...
install -d -o panelvpn -g panelvpn /var/log/panelvpn
cat > /etc/systemd/system/panelvpn-api.service <<EOF
[Unit]
Description=PanelVPN API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=panelvpn
Group=panelvpn
WorkingDirectory=$APP_DIR/apps/api
EnvironmentFile=$ENV_DIR/api.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/panelvpn-web.service <<EOF
[Unit]
Description=PanelVPN Web
After=network.target panelvpn-api.service

[Service]
Type=simple
User=panelvpn
Group=panelvpn
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_DIR/web.env
ExecStart=/usr/bin/npm start --workspace web
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/panelvpn-agent.service <<EOF
[Unit]
Description=PanelVPN Agent
After=network.target

[Service]
Type=simple
User=panelvpn
Group=panelvpn
WorkingDirectory=$APP_DIR/apps/agent
ExecStart=$BIN_DIR/panelvpn-agent
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
cat > /etc/nginx/sites-available/panelvpn <<EOF
server {
    listen 80;
    server_name _;
    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    location / {
        proxy_pass http://127.0.0.1:${WEB_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/panelvpn /etc/nginx/sites-enabled/panelvpn
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl reload nginx
systemctl daemon-reload
systemctl enable --now panelvpn-api.service
systemctl enable --now panelvpn-web.service
systemctl enable --now panelvpn-agent.service
echo ok
