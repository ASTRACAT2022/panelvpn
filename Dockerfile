# Build stage for API
FROM node:18-alpine AS api-builder

WORKDIR /app/apps/api

# Copy package files
COPY apps/api/package*.json ./
COPY package*.json /app/
COPY apps/api/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/api/src ./src
COPY apps/api/tsconfig*.json ./

# Build the application
RUN npm run build

# Production stage for API
FROM node:18-alpine AS api-prod

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=api-builder /app/apps/api/dist ./dist
COPY --from=api-builder /app/apps/api/node_modules ./node_modules
COPY --from=api-builder /app/apps/api/package*.json ./
COPY --from=api-builder /app/apps/api/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]

# Build stage for Web
FROM node:18-alpine AS web-builder

WORKDIR /app/apps/web

# Copy package files
COPY apps/web/package*.json ./
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/web ./

# Build the application
RUN npm run build

# Production stage for Web
FROM node:18-alpine AS web-prod

WORKDIR /app

# Install dependencies for production
COPY apps/web/package*.json ./
RUN npm install --production

# Copy built application
COPY --from=web-builder /app/apps/web/.next ./.next
COPY --from=web-builder /app/apps/web/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]

# Build stage for Agent
FROM golang:1.21-alpine AS agent-builder

WORKDIR /app/apps/agent

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY apps/agent/go.mod ./
COPY apps/agent/go.sum* ./
RUN go mod download

# Copy source code
COPY apps/agent ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o agent .

# Production stage for Agent
FROM alpine:latest AS agent-prod

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the binary
COPY --from=agent-builder /app/apps/agent/agent .
COPY --from=agent-builder /app/apps/agent/agent-config.json .

CMD ["./agent"]
