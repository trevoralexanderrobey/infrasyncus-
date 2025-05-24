#!/bin/bash

echo "🚀 Starting InfraSyncus with JanusGraph..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start JanusGraph
echo "📊 Starting JanusGraph..."
docker-compose -f docker-compose.janusgraph.yml up -d

# Wait for JanusGraph to be ready
echo "⏳ Waiting for JanusGraph to be ready..."
sleep 10

# Check if JanusGraph is accessible
for i in {1..12}; do
    if curl -s http://localhost:8182 > /dev/null; then
        echo "✅ JanusGraph is ready!"
        break
    fi
    echo "⏳ Waiting for JanusGraph... ($i/12)"
    sleep 5
done

# Start the application
echo "🏗️ Building backend..."
cd backend && npm run build

echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/infrasyncus"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Zettelkasten
ZETTELKASTEN_PASSWORD="demo-password"

# JanusGraph Configuration
JANUSGRAPH_HOST="localhost"
JANUSGRAPH_PORT="8182"
EOF
    echo "📝 Created .env file with default settings"
fi

echo "🚀 Starting application..."
npm run start:prod

echo "🎉 Application should be running at http://localhost:3001" 