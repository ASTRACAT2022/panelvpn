#!/bin/bash

# Quick demo setup script - minimal requirements

set -e

echo "🚀 Setting up demo environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check what's available
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo -e "${YELLOW}📥 Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Create demo directories
echo -e "${BLUE}📁 Creating demo directories...${NC}"
mkdir -p demo/{api,web,agent} config/sing-box ssl logs

# Setup API demo
echo -e "${BLUE}🔧 Setting up API demo...${NC}"
cd apps/api

# Install dependencies
echo -e "${BLUE}📦 Installing API dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${BLUE}🔄 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}✅ API setup completed${NC}"
cd ../..

# Setup Web demo
echo -e "${BLUE}🔧 Setting up Web demo...${NC}"
cd apps/web

# Install dependencies
echo -e "${BLUE}📦 Installing Web dependencies...${NC}"
npm install

# Build the application
echo -e "${BLUE}🏗️  Building Web application...${NC}"
npm run build

echo -e "${GREEN}✅ Web setup completed${NC}"
cd ../..

echo -e "${GREEN}🎉 Demo setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Start PostgreSQL (if available)"
echo -e "2. Start Redis (if available)"
echo -e "3. Start API: cd apps/api && npm run start:dev"
echo -e "4. Start Web: cd apps/web && npm run start"
echo ""
echo -e "${BLUE}🔗 Demo URLs (when services are running):${NC}"
echo -e "   API: http://localhost:3001"
echo -e "   Web: http://localhost:3000"
echo -e "   API Docs: http://localhost:3001/api/docs"
echo ""
echo -e "${YELLOW}⚠️  Note: For full functionality, install PostgreSQL and Redis${NC}"
echo -e "${YELLOW}   PostgreSQL: brew install postgresql && brew services start postgresql${NC}"
echo -e "${YELLOW}   Redis: brew install redis && brew services start redis${NC}"