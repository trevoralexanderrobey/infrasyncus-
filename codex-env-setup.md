# InfraSyncus ChatGPT Codex Environment Setup

## Environment Variables for Codex

Add these environment variables to your ChatGPT Codex environment:

```bash
# Core Application Environment Variables
export NODE_ENV="development"
export PORT="3000"

# Database Configuration
export DATABASE_URL="file:./backend/dev.db"

# Authentication & Security
export JWT_SECRET="codex-testing-jwt-secret-key-12345-super-secure"
export ZETTELKASTEN_PASSWORD="codex-demo-password"

# CORS Configuration
export CORS_ORIGIN="http://localhost:5173"

# JanusGraph Database (Optional - for advanced graph features)
export JANUSGRAPH_HOST="localhost"
export JANUSGRAPH_PORT="8182"

# AI Integration (Optional - for enhanced AI features)
export OLLAMA_HOST="http://localhost:11434"

# Development/Testing flags
export CODEX_TESTING="true"
export LOG_LEVEL="debug"
```

## Secrets Configuration

If your Codex environment supports secrets, add these:

### Secret: DATABASE_URL
```
file:./backend/dev.db
```

### Secret: JWT_SECRET
```
codex-testing-jwt-secret-key-12345-super-secure
```

### Secret: ZETTELKASTEN_PASSWORD
```
codex-demo-password
```

## Quick Setup Commands for Codex

Run these commands in sequence in your Codex terminal:

```bash
# 1. Download and run the setup script
curl -sSL https://raw.githubusercontent.com/your-repo/infrasyncus/main/codex-setup.sh | bash

# Or if you have the script locally:
chmod +x codex-setup.sh && ./codex-setup.sh

# 2. Set environment variables
export ZETTELKASTEN_PASSWORD="codex-demo-password"
export DATABASE_URL="file:./backend/dev.db" 
export JWT_SECRET="codex-testing-jwt-secret-key-12345"

# 3. Navigate to project and install dependencies
cd infrasyncus
npm run install-all

# 4. Start the application
npm run start
```

## Testing Commands for Codex

After setup, run these to test the application:

```bash
# Test API connection
node test-api.js

# Test frontend-backend connection
node test-connection.js

# Run backend unit tests
cd backend && npm test

# Run all tests (if servers are already running)
./run-tests.sh
```

## Application Endpoints for Testing

### Backend API Endpoints
- Health Check: `http://localhost:3000/health`
- Notes: `http://localhost:3000/zettelkasten/notes?password=codex-demo-password`
- Text Analysis: `POST http://localhost:3000/zettelkasten/analyze?password=codex-demo-password`
- AI Models: `http://localhost:3000/zettelkasten/ai/models?password=codex-demo-password`

### Frontend
- Application: `http://localhost:5173`

## Common Codex Issues & Solutions

### Issue: "npm not found"
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: "Permission denied"
```bash
# Make script executable
chmod +x codex-setup.sh
```

### Issue: "Port already in use"
```bash
# Kill processes on ports 3000 and 5173
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### Issue: "Database connection failed"
```bash
# Reset and regenerate database
cd backend
npx prisma migrate reset --force
npx prisma generate
npx prisma migrate dev --name init
```

## Minimal Test Script for Codex

If you want a quick test without the full setup, save this as `quick-test.js`:

```javascript
const http = require('http');

// Simple health check
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend health check: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('🎉 Backend is running successfully!');
  }
});

req.on('error', (err) => {
  console.log('❌ Backend not running:', err.message);
  console.log('💡 Start with: cd backend && npm run start:dev');
});

req.end();
```

Then run: `node quick-test.js` 