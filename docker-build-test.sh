#!/bin/bash

# Complete Docker build and test runner

set -e

echo "🐳 Starting complete Docker build and test process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_retries=30
    local retry_count=0

    echo -e "${BLUE}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ Waiting for $service_name... ($((retry_count + 1))/$max_retries)${NC}"
            sleep 10
            retry_count=$((retry_count + 1))
        fi
    done

    echo -e "${RED}❌ $service_name is not responding after $max_retries attempts${NC}"
    return 1
}

# Check Docker
check_docker

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans || true

# Build all services
echo -e "${BLUE}🏗️  Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo -e "${BLUE}🚀 Starting all services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for PostgreSQL to be ready
wait_for_service "PostgreSQL" "http://localhost:5432" || {
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
}

# Wait for Redis to be ready
wait_for_service "Redis" "http://localhost:6379" || {
    echo -e "${RED}❌ Redis failed to start${NC}"
    docker-compose -f docker-compose.prod.yml logs redis
    exit 1
}

# Wait for API to be ready
wait_for_service "API" "http://localhost:3001/health" || {
    echo -e "${RED}❌ API failed to start${NC}"
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
}

# Wait for Web to be ready
wait_for_service "Web" "http://localhost:3000" || {
    echo -e "${RED}❌ Web failed to start${NC}"
    docker-compose -f docker-compose.prod.yml logs web
    exit 1
}

# Wait for Nginx to be ready
wait_for_service "Nginx" "http://localhost:5000" || {
    echo -e "${RED}❌ Nginx failed to start${NC}"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
}

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"
docker-compose -f docker-compose.prod.yml exec -T api npx prisma generate
docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec -T api npx prisma db seed

# Run health checks
echo -e "${BLUE}🏥 Running health checks...${NC}"

# API Health Check
if curl -f -s "http://localhost:5000/api/health" > /dev/null; then
    echo -e "${GREEN}✅ API health check passed${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    exit 1
fi

# Web Health Check
if curl -f -s "http://localhost:5000" > /dev/null; then
    echo -e "${GREEN}✅ Web health check passed${NC}"
else
    echo -e "${RED}❌ Web health check failed${NC}"
    exit 1
fi

# Run integration tests
echo -e "${BLUE}🧪 Running integration tests...${NC}"
./run-tests.sh

TEST_RESULT=$?

# Show service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Show logs if tests failed
if [ $TEST_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Integration tests failed. Showing logs...${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50 api
    docker-compose -f docker-compose.prod.yml logs --tail=50 web
fi

# Final summary
echo -e "\n${GREEN}🎉 Docker build and test process completed!${NC}"
echo -e "${BLUE}📋 Access URLs:${NC}"
echo -e "   Web Interface: http://localhost:5000"
echo -e "   API Documentation: http://localhost:5000/api/docs"
echo -e "   Admin Login: admin@panelvpn.com / password"
echo -e "   User Login: user@panelvpn.com / password"
echo -e "${BLUE}🐳 Docker Commands:${NC}"
echo -e "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo -e "   Remove volumes: docker-compose -f docker-compose.prod.yml down --volumes"

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi