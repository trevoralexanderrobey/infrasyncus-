#!/bin/bash

# InfraSyncus - ChatGPT Codex Setup Script
# This script sets up the complete development environment for testing

echo "🚀 Setting up InfraSyncus for ChatGPT Codex..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js..."
    # For Ubuntu/Debian systems
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # For macOS (if available)
    # brew install node
    
    # For other systems, you may need to install manually
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
    "deploy": "npm run install-all && npm run build && npm run start:prod",
    "test": "cd backend && npm test",
    "test:e2e": "cd backend && npm run test:e2e",
    "test:frontend": "cd frontend && npm test"
  },
  "keywords": ["text-analysis", "network-visualization", "zettelkasten", "knowledge-management", "embedded-graph", "graph-database"],
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
mkdir -p backend/src/ai
mkdir -p backend/src/auth/dto
mkdir -p backend/src/graph
mkdir -p backend/src/janusgraph
mkdir -p backend/src/prisma
mkdir -p backend/src/text-processing
mkdir -p backend/prisma/migrations

# Create backend package.json
cat > backend/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "description": "NestJS backend for InfraSyncus platform",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/graphql": "^12.1.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/schedule": "^3.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "@prisma/client": "^5.0.0",
    "axios": "^1.6.7",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "gremlin": "^3.7.0",
    "node-fetch": "^3.3.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "typeorm": "^0.3.24"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.17",
    "@types/gremlin": "^3.6.7",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^4.0.1",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^8.0.0",
    "eslint-plugin-prettier": "^4.0.0",
    "jest": "^29.5.0",
    "prettier": "^2.0.0",
    "prisma": "^5.0.0",
    "supertest": "^6.0.0",
    "ts-jest": "^29.0.0",
    "ts-loader": "^9.0.0",
    "ts-node": "^10.0.0",
    "tsconfig-paths": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Create backend configuration files
cat > backend/nest-cli.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
EOF

cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
EOF

cat > backend/jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/'
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts'
  ]
};
EOF

# Create Prisma schema
cat > backend/prisma/schema.prisma << 'EOF'
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  email     String   @unique
  password  String
  name      String?
  notes     Note[]
}

model Note {
  id        String   @id @default(cuid())
  content   String
  tags      String   @default("[]")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    Int?
  user      User?    @relation(fields: [userId], references: [id])
  
  linksFrom Link[] @relation("SourceNote")
  linksTo   Link[] @relation("TargetNote")
}

model Link {
  id           String @id @default(cuid())
  sourceNoteId String
  targetNoteId String
  createdAt    DateTime @default(now())
  
  sourceNote Note @relation("SourceNote", fields: [sourceNoteId], references: [id], onDelete: Cascade)
  targetNote Note @relation("TargetNote", fields: [targetNoteId], references: [id], onDelete: Cascade)
  
  @@unique([sourceNoteId, targetNoteId])
}
EOF

# Create environment file
cat > backend/.env << EOF
# InfraSyncus Environment Configuration
CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:5173}"
DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
JWT_SECRET="${JWT_SECRET:-codex-testing-jwt-secret-key-12345}"
ZETTELKASTEN_PASSWORD="${TEST_PASSWORD:-codex-demo-password}"
JANUSGRAPH_HOST="${JANUSGRAPH_HOST:-localhost}"
JANUSGRAPH_PORT="${JANUSGRAPH_PORT:-8182}"
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
NODE_ENV="${NODE_ENV:-development}"
PORT=${PORT:-3000}
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Setup Frontend
echo "🎨 Setting up Frontend..."
mkdir -p frontend/src/components
mkdir -p frontend/src/assets
mkdir -p frontend/public

# Create frontend package.json
cat > frontend/package.json << 'EOF'
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@react-sigma/core": "^5.0.2",
    "@types/lodash": "^4.17.17",
    "axios": "^1.9.0",
    "graphology": "^0.25.4",
    "lodash": "^4.17.21",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0",
    "sigma": "^3.0.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.25.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.30.1",
    "vite": "^6.3.5",
    "vitest": "^1.0.0"
  }
}
EOF

# Create Vite config
cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
EOF

# Create frontend TypeScript config
cat > frontend/tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
EOF

cat > frontend/tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}
EOF

cat > frontend/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create basic test files
echo "🧪 Creating test files..."

# Backend API test
cat > test-api.js << 'EOF'
const fetch = require("node-fetch");

async function testAPI() {
  console.log("🔍 Testing InfraSyncus API Connection...");
  console.log("==========================================");

  const baseURL = "http://localhost:3000";
  const password = process.env.TEST_PASSWORD || "codex-demo-password";

  try {
    // Test health endpoint
    console.log("\n1. Testing Health Endpoint...");
    const healthResponse = await fetch(`${baseURL}/health`);
    console.log(`✅ Health Status: ${healthResponse.status}`);

    // Test zettelkasten notes
    console.log("\n2. Testing Zettelkasten Notes...");
    const notesResponse = await fetch(
      `${baseURL}/zettelkasten/notes?password=${password}`
    );
    if (notesResponse.ok) {
      const notes = await notesResponse.json();
      console.log(`✅ Notes Retrieved: ${notes.length} notes`);
    } else {
      console.log(`❌ Notes Error: ${notesResponse.status}`);
    }

    // Test text analysis
    console.log("\n3. Testing Text Analysis...");
    const analysisResponse = await fetch(
      `${baseURL}/zettelkasten/analyze?password=${password}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "artificial intelligence machine learning algorithms data science",
        }),
      }
    );
    if (analysisResponse.ok) {
      const analysis = await analysisResponse.json();
      console.log(`✅ Analysis Complete: ${analysis.nodes?.length || 0} nodes`);
    } else {
      console.log(`❌ Analysis Error: ${analysisResponse.status}`);
    }

    // Test AI models
    console.log("\n4. Testing AI Models...");
    const modelsResponse = await fetch(
      `${baseURL}/zettelkasten/ai/models?password=${password}`
    );
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log(`✅ AI Models: ${models.length} available`);
    } else {
      console.log(`❌ AI Models Error: ${modelsResponse.status}`);
    }

    console.log("\n✨ API Connection Test Complete!");
  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}`);
    console.log("\n💡 To start the backend:");
    console.log("   cd backend && npm run start:dev");
  }
}

testAPI();
EOF

# Frontend-Backend connection test
cat > test-connection.js << 'EOF'
const fetch = require("node-fetch");

async function testConnection() {
  console.log("🔗 Testing Frontend-Backend Connection...");
  console.log("==========================================");

  const frontendURL = "http://localhost:5173";
  const backendURL = "http://localhost:3000";

  try {
    // Test frontend
    console.log("\n1. Testing Frontend...");
    const frontendResponse = await fetch(frontendURL);
    console.log(`✅ Frontend Status: ${frontendResponse.status}`);

    // Test backend
    console.log("\n2. Testing Backend...");
    const backendResponse = await fetch(backendURL);
    console.log(`✅ Backend Status: ${backendResponse.status}`);

    // Test CORS
    console.log("\n3. Testing CORS...");
    const corsResponse = await fetch(`${backendURL}/health`, {
      headers: {
        'Origin': frontendURL,
        'Access-Control-Request-Method': 'GET',
      },
    });
    console.log(`✅ CORS Status: ${corsResponse.status}`);

    console.log("\n✨ Connection Test Complete!");
  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}`);
  }
}

testConnection();
EOF

# Create run script
cat > run-tests.sh << 'EOF'
#!/bin/bash

echo "🚀 Running InfraSyncus Tests..."
echo "==============================="

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Backend not running. Starting backend..."
    cd backend && npm run start:dev &
    BACKEND_PID=$!
    echo "⏳ Waiting for backend to start..."
    sleep 10
else
    echo "✅ Backend is running"
fi

# Check if frontend is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Frontend not running. Starting frontend..."
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    echo "⏳ Waiting for frontend to start..."
    sleep 5
else
    echo "✅ Frontend is running"
fi

# Run tests
echo "🧪 Running API tests..."
node test-api.js

echo "🧪 Running connection tests..."
node test-connection.js

echo "🧪 Running backend unit tests..."
cd backend && npm test

echo "✨ All tests completed!"

# Cleanup if we started the servers
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID
fi
if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID
fi
EOF

chmod +x run-tests.sh

# Initialize database
echo "🗄️ Setting up database..."
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables (see below)"
echo "2. Start the application: npm run start"
echo "3. Run tests: ./run-tests.sh"
echo ""
echo "🔑 Required Environment Variables:"
echo "   TEST_PASSWORD=password123"
echo "   DATABASE_URL=file:./backend/dev.db"
echo "   JWT_SECRET=codex-testing-jwt-secret-key-12345"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🧪 Test Commands:"
echo "   npm test              # Backend unit tests"
echo "   node test-api.js      # API connection test"
echo "   node test-connection.js # Frontend-Backend test"
echo "   ./run-tests.sh        # Run all tests"
echo ""
echo "🎉 InfraSyncus is ready for ChatGPT Codex testing!" 