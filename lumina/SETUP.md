# Lumina Setup Guide

## Prerequisites

1. **Node.js** (v18+): https://nodejs.org
2. **Ollama** (for local AI): https://ollama.ai

## Installation Steps

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Setup Local AI Model

```bash
# Install Ollama from https://ollama.ai
# Then pull the model:
ollama pull llama3:8b
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed (defaults should work).

### 4. Start Development

```bash
# From root directory
npm run dev
```

This starts both:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Usage

1. Open http://localhost:3000
2. Write code in the editor
3. See real-time AST visualization
4. Ask Lumina questions for Socratic guidance
5. Use voice interface for hands-free help

## Features to Explore

- **Visual Runtime**: Watch your code structure visualized
- **Frustration Meter**: Tracks your emotional state
- **Voice Interface**: Talk to Lumina (Chrome/Edge only)
- **Adaptive Pedagogy**: Get hints, not answers

## Troubleshooting

**Ollama not connecting?**
- Ensure Ollama is running: `ollama serve`
- Check http://localhost:11434

**Voice not working?**
- Use Chrome or Edge browser
- Grant microphone permissions

**Port conflicts?**
- Change ports in `backend/.env` and `frontend/vite.config.ts`
