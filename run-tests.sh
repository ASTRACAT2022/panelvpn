#!/bin/bash

# Integration test runner for Sing-box Panel

set -e

echo "🧪 Starting integration tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if API is running
API_URL="http://localhost:5000/api"
MAX_RETRIES=30
RETRY_COUNT=0

echo "🔍 Checking if API is available at $API_URL..."

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "$API_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ API is ready${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for API... ($((RETRY_COUNT + 1))/$MAX_RETRIES)${NC}"
        sleep 10
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ API is not responding after $MAX_RETRIES attempts${NC}"
    echo "Please ensure the application is running with: docker-compose -f docker-compose.prod.yml up"
    exit 1
fi

# Run tests
echo "🚀 Running integration tests..."
cd apps/api

# Install test dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the integration tests
echo "🏃 Running test suite..."
node test/integration.test.js

TEST_RESULT=$?

cd ../..

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All integration tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some integration tests failed${NC}"
    exit 1
fi