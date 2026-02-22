# PanelVPN - Sing-box Web Panel

A scalable Sing-box web panel (Remnawave analog) with Master-Panel/Node-Agent architecture and mTLS security.

## 🚀 Features

- **Modern Architecture**: Monorepo with Next.js 15 frontend, NestJS backend, and Go node agent
- **Secure Communication**: mTLS between panel and nodes
- **Database Management**: Prisma ORM with PostgreSQL
- **Responsive UI**: Tailwind CSS + shadcn/ui components
- **Docker Support**: Full containerization with health checks
- **API Documentation**: Swagger/OpenAPI integration
- **Monitoring**: Real-time node monitoring and statistics
- **Subscription Management**: Sing-box config generation and management

## 📋 System Requirements

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Go 1.21+
- Docker & Docker Compose (optional)

## 🛠️ Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/ASTRACAT2022/panelvpn.git
cd panelvpn

# Copy environment variables
cp .env.example .env
# Edit .env with your settings

# Run complete deployment
./docker-build-test.sh
```

### Option 2: Local Development

```bash
# Install dependencies
./setup-dev.sh

# Start services
brew services start postgresql
brew services start redis

# Start API (Terminal 1)
cd apps/api && npm run start:dev

# Start Web (Terminal 2)
cd apps/web && npm run start

# Start Agent (Terminal 3)
cd apps/agent && go run .
```

## 🔗 Access URLs

- **Web Interface**: http://localhost:3000 (or port 5000 for Docker)
- **API Documentation**: http://localhost:3001/api/docs
- **Default Admin**: admin@panelvpn.com / password
- **Default User**: user@panelvpn.com / password

## 🔁 Remnawave Migration

- Import endpoint: `POST /subscriptions/import/remnawave`
- Public subscription endpoint by old short id: `GET /subscriptions/short/:shortId`
- Subscription output formats:
  - `?format=base64` (default, compatibility mode for subscription clients)
  - `?format=raw` (plain `ss://` lines)
  - `?format=json` (API JSON config)

Example import payload:

```json
{
  "defaultClusterId": "your-cluster-id",
  "users": [
    {
      "email": "user1@example.com",
      "name": "User 1",
      "subscriptions": [
        {
          "name": "Imported Sub",
          "shortId": "abc123shortid",
          "expiresAt": "2026-12-31T23:59:59.000Z"
        }
      ]
    }
  ]
}
```

## 📁 Project Structure

```
panelvpn/
├── apps/
│   ├── api/                 # NestJS Backend API
│   │   ├── prisma/          # Database schema and migrations
│   │   ├── src/             # API source code
│   │   └── test/            # Integration tests
│   ├── web/                 # Next.js Frontend
│   │   ├── src/             # Frontend source code
│   │   └── public/          # Static assets
│   └── agent/               # Go Node Agent
│       ├── api/             # API client
│       ├── config/          # Configuration management
│       └── service/         # Sing-box service management
├── config/                  # Configuration files
├── ssl/                     # SSL certificates
├── logs/                    # Log files
└── nginx.conf              # Nginx configuration
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
POSTGRES_USER=panel
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=panelvpn

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Ports
NGINX_PORT=5000
API_PORT=3001
WEB_PORT=3000

# Redis
REDIS_URL=redis://redis:6379
```

### Nginx Configuration

The panel is configured to run on port 5000 for compatibility with resolver proxy setups. SSL termination should be handled by your reverse proxy.

## 🧪 Testing

```bash
# Run all tests
./run-tests.sh

# Run specific test suite
cd apps/api && npm run test

# Database seeding
node apps/api/prisma/seed.js
```

## 📊 Monitoring

- Node health monitoring
- Traffic statistics
- Real-time connection tracking
- System resource usage

## 🔒 Security

- JWT-based authentication
- mTLS for node communication
- Input validation and sanitization
- Rate limiting
- Secure password hashing

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Check the [documentation](DEPLOYMENT.md)
- Review logs with `docker-compose logs`
- Check service health endpoints
- Open an issue on GitHub

## 🎉 Acknowledgments

- Sing-box team for the amazing proxy tool
- Next.js and NestJS communities
- All contributors and supporters
