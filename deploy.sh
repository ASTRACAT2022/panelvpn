#!/bin/bash

# Production deployment script for Sing-box Panel

set -e

echo "🚀 Starting production deployment..."

# Create necessary directories
mkdir -p config/sing-box ssl logs

# No SSL needed for port 5000 (plain HTTP)

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
docker-compose -f docker-compose.prod.yml exec -T api npx prisma db seed

# Health check
echo "🏥 Running health checks..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    exit 1
fi

if curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Web interface is healthy"
else
    echo "❌ Web interface health check failed"
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo "📋 Access URLs:"
echo "   Web Interface: http://localhost:5000"
echo "   API Documentation: http://localhost:5000/api/docs"
echo "   Admin Login: admin@panelvpn.com / password"
echo "   User Login: user@panelvpn.com / password"