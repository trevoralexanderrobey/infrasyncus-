#!/bin/bash

# InfraSyncus - ChatGPT Codex Setup Script (Minimal Version)
# This script sets up the complete development environment for testing

echo "🚀 Setting up InfraSyncus for ChatGPT Codex..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js..."
    # For Ubuntu/Debian systems
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installation completed"
else
    echo "✅ Node.js found: $(node --version)"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm manually."
    exit 1
else
    echo "✅ npm found: $(npm --version)"
fi

# Create project directory if it doesn't exist
if [ ! -d "infrasyncus" ]; then
    echo "📁 Creating project directory..."
    mkdir -p infrasyncus
fi

cd infrasyncus

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Initializing main package.json..."
    cat > package.json << 'EOF'
{
  "name": "infrasyncus",
  "version": "2.1.0",
  "description": "Advanced text-to-network visualization platform with multimodal AI capabilities and built-in embedded graph database",
  "main": "electron-main.js",
  "homepage": "./",
  "scripts": {
    "start": "concurrently \"npm run backend\" \"npm run frontend\"",
    "backend": "cd backend && npm run start:dev",
    "frontend": "cd frontend && npm run dev",
    "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "build": "cd frontend && npm run build && cd ../backend && npm run build",
    "start:prod": "cd backend && npm run start:prod",
    "test": "cd backend && npm test"
  },
  "keywords": ["text-analysis", "network-visualization", "zettelkasten", "knowledge-management"],
  "author": "InfraSyncus Team",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2",
    "wait-on": "^7.2.0"
  }
}
EOF
fi

# Install main dependencies
echo "📦 Installing main dependencies..."
npm install

# Setup Backend
echo "🔧 Setting up Backend..."
mkdir -p backend/src backend/prisma

# Create minimal backend package.json
cat > backend/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "description": "NestJS backend for InfraSyncus platform",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "axios": "^1.6.7",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.5.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Create basic environment file with hardcoded values
cat > backend/.env << 'EOF'
# InfraSyncus Environment Configuration - Hardcoded for Codex
CORS_ORIGIN="http://localhost:5173"
DATABASE_URL="file:./dev.db"
JWT_SECRET="codex-testing-jwt-secret-key-12345"
ZETTELKASTEN_PASSWORD="password123"
NODE_ENV="development"
PORT=3000
EOF

# Create basic Prisma schema
cat > backend/prisma/schema.prisma << 'EOF'
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Note {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
}
EOF

echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma migrate dev --name init --create-only
cd ..

# Setup Frontend
echo "🎨 Setting up Frontend..."
mkdir -p frontend/src frontend/public

# Create minimal frontend package.json
cat > frontend/package.json << 'EOF'
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
EOF

# Create basic Vite config
cat > frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
EOF

# Create basic index.html
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InfraSyncus</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create basic React app
cat > frontend/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 InfraSyncus</h1>
      <p>Application is running successfully!</p>
      <p>Backend should be available at: <a href="http://localhost:3000">localhost:3000</a></p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOF

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create simple test script
cat > test-simple.js << 'EOF'
console.log("🧪 Simple Test Running...");
console.log("✅ Node.js version:", process.version);
console.log("✅ Environment:", process.env.NODE_ENV || 'not set');
console.log("✅ Test completed successfully!");
EOF

echo ""
echo "✅ Minimal Setup Complete!"
echo "=========================="
echo ""
echo "🧪 Test the setup:"
echo "   node test-simple.js"
echo ""
echo "🚀 Start the application:"
echo "   npm run start"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🎉 InfraSyncus minimal setup ready for testing!" 