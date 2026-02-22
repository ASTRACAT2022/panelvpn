#!/bin/bash

# Database migration and setup script

set -e

echo "🗄️  Setting up database..."

# Navigate to API directory
cd apps/api

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create migration if it doesn't exist
if [ ! -d "prisma/migrations" ]; then
    echo "📁 Creating initial migration..."
    npx prisma migrate dev --name init
else
    echo "📊 Running pending migrations..."
    npx prisma migrate deploy
fi

# Seed database with initial data
echo "🌱 Seeding database..."
node prisma/seed.js

echo "✅ Database setup completed!"