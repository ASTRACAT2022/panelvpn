#!/bin/bash

# Development setup script for local testing without Docker

set -e

echo "🔧 Setting up development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found. Please ensure PostgreSQL is running.${NC}"
    echo -e "${BLUE}💡 You can install PostgreSQL with: brew install postgresql${NC}"
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found. Please ensure Redis is running.${NC}"
    echo -e "${BLUE}💡 You can install Redis with: brew install redis${NC}"
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p config/sing-box ssl logs/nginx

# Setup API
echo -e "${BLUE}🔧 Setting up API...${NC}"
cd apps/api

# Install dependencies
echo -e "${BLUE}📦 Installing API dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${BLUE}🔄 Generating Prisma client...${NC}"
npx prisma generate

# Setup database (if PostgreSQL is running)
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${BLUE}🗄️  Setting up database...${NC}"
    
    # Create database if it doesn't exist
    createdb panelvpn 2>/dev/null || true
    
    # Run migrations
    npx prisma migrate deploy
    
    # Seed database
    node prisma/seed.js
    
    echo -e "${GREEN}✅ Database setup completed${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Skipping database setup.${NC}"
    echo -e "${BLUE}💡 Start PostgreSQL with: brew services start postgresql${NC}"
fi

cd ../..

# Setup Web
echo -e "${BLUE}🔧 Setting up Web frontend...${NC}"
cd apps/web

# Install dependencies
echo -e "${BLUE}📦 Installing Web dependencies...${NC}"
npm install

# Build the application
echo -e "${BLUE}🏗️  Building Web application...${NC}"
npm run build

cd ../..

# Setup Agent
echo -e "${BLUE}🔧 Setting up Agent...${NC}"
cd apps/agent

# Install dependencies
echo -e "${BLUE}📦 Installing Agent dependencies...${NC}"
go mod download

# Build the agent
echo -e "${BLUE}🏗️  Building Agent...${NC}"
go build -o agent .

cd ../..

echo -e "${GREEN}🎉 Development setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Ensure PostgreSQL is running: brew services start postgresql"
echo -e "2. Ensure Redis is running: brew services start redis"
echo -e "3. Start API: cd apps/api && npm run start:dev"
echo -e "4. Start Web: cd apps/web && npm run start"
echo -e "5. Start Agent: cd apps/agent && ./agent"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo -e "   API: http://localhost:3001"
echo -e "   Web: http://localhost:3000"
echo -e "   API Docs: http://localhost:3001/api/docs"