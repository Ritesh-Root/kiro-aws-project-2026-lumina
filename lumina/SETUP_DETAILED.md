# Lumina Detailed Setup Guide

This comprehensive guide covers installation, configuration, troubleshooting, and development workflow.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

## Prerequisites

### Required Software
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 9+** (comes with Node.js)
- **Ollama** ([Download](https://ollama.ai/download))
- **Git** ([Download](https://git-scm.com/downloads))

### Hardware Requirements
| Tier | RAM | CPU | Disk | Model |
|------|-----|-----|------|-------|
| Minimum | 8GB | 4-core | 10GB | Gemma-7B (4-bit) |
| Recommended | 16GB | 6-core/GPU | 20GB | Llama-3-8B (8-bit) |
| Optimal | 32GB | RTX 3060/M1 Pro | 30GB | Llama-3-8B (FP16) |

## Installation

### 1. Install Ollama

#### macOS
```bash
brew install ollama
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download and run installer from [ollama.ai/download](https://ollama.ai/download)

### 2. Start Ollama and Pull Model

```bash
# Start Ollama service
ollama serve

# In new terminal, pull model
ollama pull llama3

# Verify
ollama list
curl http://localhost:11434/api/tags
```

### 3. Clone Repository

```bash
git clone https://github.com/yourusername/lumina.git
cd lumina
```

### 4. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# This installs:
# - Root dependencies
# - backend/ dependencies
# - frontend/ dependencies
# - shared/ dependencies
```

### 5. Build Shared Types

```bash
cd shared
npm run build
cd ..
```

## Configuration

### Backend Configuration

Create `backend/.env`:
```env
PORT=3001
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=llama3
NODE_ENV=development
```

### Frontend Configuration

Frontend uses Vite defaults. To customize, edit `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

## Running the Application

### Development Mode

#### Option A: Concurrent (Recommended)
```bash
# From project root
npm run dev
```

#### Option B: Separate Terminals
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Testing

### Manual API Testing

#### 1. Test Visualization
```bash
curl -X POST http://localhost:3001/api/visualize \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function hello() { return \"world\"; }",
    "language": "javascript"
  }'
```

#### 2. Test Sentiment Analysis
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I am so confused and stuck"}'
```

#### 3. Test Pedagogy
```bash
curl -X POST http://localhost:3001/api/pedagogy \
  -H "Content-Type: application/json" \
  -d '{
    "userQuestion": "What does this error mean?",
    "code": "if (x = 5) {}",
    "language": "javascript",
    "conversationHistory": [],
    "frustrationLevel": 30
  }'
```

### Automated Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

### Ollama Issues

#### Problem: "Failed to connect to Ollama"
```bash
# Check if Ollama is running
ps aux | grep ollama  # macOS/Linux
tasklist | findstr ollama  # Windows

# Start Ollama
ollama serve

# Verify connection
curl http://localhost:11434/api/tags
```

#### Problem: "Model not found"
```bash
# List installed models
ollama list

# Pull missing model
ollama pull llama3

# Verify
ollama list
```

### Port Conflicts

#### Problem: "Port 3001 already in use"
```bash
# Find process
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in backend/.env
```

### TypeScript Errors

#### Problem: "Cannot find module '@lumina/shared'"
```bash
# Rebuild shared package
cd shared
npm run build

# Clear and reinstall
cd ..
rm -rf node_modules */node_modules
npm install
```

### Memory Issues

#### Problem: "JavaScript heap out of memory"
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Or use smaller model
ollama pull gemma:7b
# Update backend/.env: MODEL_NAME=gemma:7b
```

### Build Errors

#### Problem: "Module not found" during build
```bash
# Clean build artifacts
npm run clean

# Rebuild everything
npm run build
```

## Development Workflow

### Hot Reload
- Frontend: Vite HMR (instant)
- Backend: tsx watch (auto-restart)

### Code Quality

```bash
# Lint all packages
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Debugging

#### Backend (VS Code)
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "runtimeExecutable": "tsx",
      "console": "integratedTerminal",
      "env": {
        "DEBUG": "*"
      }
    }
  ]
}
```

#### Frontend
Install React DevTools browser extension

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

## Production Build

### Build All Packages
```bash
npm run build
```

### Start Production Server
```bash
# Backend
cd backend
npm start

# Frontend (serve static files)
cd frontend
npx serve -s dist -p 5173
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3001
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=llama3
```

## Performance Optimization

### Model Selection
```bash
# For 8GB RAM
ollama pull gemma:7b

# For 16GB RAM (recommended)
ollama pull llama3

# For 32GB+ RAM
ollama pull llama3:70b
```

### Cache Configuration
Edit `backend/src/services/ast-parser.ts`:
```typescript
const astCache = new LRUCache(100); // Increase cache size
```

## Monitoring

### Check System Resources
```bash
# Memory usage
free -h  # Linux
vm_stat  # macOS

# Ollama memory
ps aux | grep ollama

# Node.js memory
node --max-old-space-size=4096 backend/dist/index.js
```

### Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Ollama logs
tail -f ~/.ollama/logs/server.log
```

## Next Steps

1. Read [README.md](README.md) for project overview
2. Review [ARCHITECTURE.md](.kiro/specs/lumina/ARCHITECTURE.md)
3. Check [requirements.md](.kiro/specs/lumina/requirements.md)
4. Join [Discord](https://discord.gg/lumina) for support

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev servers |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `ollama serve` | Start Ollama |
| `ollama pull llama3` | Download model |

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/lumina/issues)
- Discussions: [Ask questions](https://github.com/yourusername/lumina/discussions)
- Email: support@lumina.dev

---

**Happy coding! 🌟**
