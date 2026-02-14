# Lumina Architecture

## System Overview

Lumina is a privacy-first, offline AI teaching assistant that combines real-time code visualization, sentiment-aware voice interaction, and Socratic pedagogy. All processing occurs locally using Ollama (Llama-3-8B) with no external API calls.

## Core Components

### 1. Visual Runtime Engine

**AST Parser** (`backend/src/services/ast-parser.ts`)
- Parses JavaScript/TypeScript using @babel/parser with sourceType: 'module'
- Traverses AST using @babel/traverse to extract:
  - Function declarations and expressions (including arrow functions)
  - Variable declarations (const, let, var)
  - Class definitions and methods
  - Import/export statements
- Returns structured `CodeStructure` with nodes and relationships

**Visualizer** (`backend/src/services/visualizer.ts`)
- Consumes `CodeStructure` from AST parser
- Generates two output formats:
  - **Mermaid syntax**: Flowchart diagrams showing function call chains
  - **React Flow nodes**: Interactive graph with draggable nodes and edges
- Maps AST node types to visual representations (e.g., FunctionDeclaration → rounded rectangle)

**Frontend Integration** (`frontend/src/components/CodeEditor.tsx`)
- Debounces code changes (300ms) to prevent excessive parsing
- Sends code to `/api/parse` endpoint on change
- Receives visualization data and updates VisualizationPanel

### 2. Empathetic Voice Interface

**Speech Recognition** (`frontend/src/components/VoiceInterface.tsx`)
- Uses Web Speech API's SpeechRecognition interface
- Continuous listening mode with interim results
- Transcripts sent to backend for sentiment analysis

**Sentiment Analyzer** (`backend/src/services/sentiment.ts`)
- Uses sentiment.js to score text from -5 (negative) to +5 (positive)
- Detects frustration keywords: "stuck", "confused", "doesn't work", "error"
- Returns sentiment score and detected keywords to frontend

**Frustration Meter** (`frontend/src/components/FrustrationMeter.tsx`)
- Visualizes sentiment score as color-coded meter (green → yellow → red)
- Triggers pedagogy mode changes when frustration exceeds threshold (-2)
- Displays detected frustration keywords to user

### 3. Adaptive Pedagogy Engine

**Pedagogy Service** (`backend/src/services/pedagogy.ts`)
- Receives context: code, error messages, sentiment score, user question
- Constructs Ollama prompt with three modes:
  - **Calm mode** (sentiment > -2): Standard Socratic questions
  - **Frustrated mode** (sentiment ≤ -2): Simpler hints, more encouragement
  - **Error mode**: Focuses on specific error explanation
- Calls Ollama API at `http://localhost:11434/api/generate`
- Streams response tokens back to frontend

**Frontend Display** (`frontend/src/components/PedagogyPanel.tsx`)
- Renders AI responses with syntax highlighting
- Shows conversation history
- Displays current pedagogy mode indicator

## Tech Stack

### Frontend (React + TypeScript)
- **UI Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Visualization**: React Flow + Mermaid.js
- **Voice**: Web Speech API
- **HTTP Client**: Axios

### Backend (Node.js + Express)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express for REST API
- **AI Integration**: Ollama SDK
- **Code Analysis**: Babel parser + traverse
- **Sentiment**: sentiment.js

### Shared
- **Type Safety**: Shared TypeScript types across frontend/backend
- **Monorepo**: npm workspaces for dependency management

## Data Flow

### Code Visualization Flow

```
CodeEditor.tsx (user types code)
    ↓ [debounced 300ms]
POST /api/parse { code: string }
    ↓
ast-parser.ts
    ├─ @babel/parser.parse(code) → AST
    └─ @babel/traverse(ast) → extract nodes
    ↓
visualizer.ts
    ├─ generateMermaid(structure) → string
    └─ generateReactFlow(structure) → { nodes[], edges[] }
    ↓
Response: { mermaid: string, reactFlow: object, structure: CodeStructure }
    ↓
VisualizationPanel.tsx renders diagrams
```

### Voice Interaction Flow

```
VoiceInterface.tsx (user speaks)
    ↓
Web Speech API → transcript: string
    ↓
POST /api/sentiment { text: string }
    ↓
sentiment.ts
    ├─ sentiment.analyze(text) → score
    └─ detectKeywords(text) → string[]
    ↓
Response: { score: number, keywords: string[] }
    ↓
FrustrationMeter.tsx updates visual indicator
    ↓ [if user asks question]
POST /api/pedagogy { code, error, sentiment, question }
    ↓
pedagogy.ts
    ├─ selectMode(sentiment) → calm | frustrated
    ├─ buildPrompt(context, mode) → string
    └─ ollama.generate({ model: 'llama3', prompt })
    ↓
Stream response tokens → PedagogyPanel.tsx
```

### Error-Driven Learning Flow

```
CodeEditor.tsx (syntax/runtime error detected)
    ↓
Extract error message and line number
    ↓
POST /api/pedagogy { code, error, sentiment: 0, question: null }
    ↓
pedagogy.ts
    ├─ Parse error type (SyntaxError, ReferenceError, etc.)
    ├─ Build Socratic prompt: "What do you think this error means?"
    └─ ollama.generate() with error context
    ↓
PedagogyPanel.tsx displays guiding questions
    ↓
User responds via voice or text
    ↓
Repeat cycle with updated context
```

### Component Communication

**Frontend → Backend**
- REST API calls using Axios
- Endpoints: `/api/parse`, `/api/sentiment`, `/api/pedagogy`
- All requests include TypeScript types from `shared/src/types.ts`

**Backend → Ollama**
- HTTP POST to `http://localhost:11434/api/generate`
- Streaming response with `stream: true`
- Model: `llama3` (8B parameters)

**Shared Types** (`shared/src/types.ts`)
```typescript
CodeStructure: { nodes: ASTNode[], relationships: Relationship[] }
SentimentResult: { score: number, keywords: string[] }
PedagogyRequest: { code: string, error?: string, sentiment: number, question?: string }
```

## Privacy Architecture

**Local Processing Chain**
1. Code never leaves the machine - parsed by local Babel instance
2. Voice transcription via browser's Web Speech API (on-device in Chrome/Edge)
3. Sentiment analysis runs in Node.js process using sentiment.js library
4. AI responses generated by Ollama running on localhost:11434
5. No analytics, tracking, or external API calls in codebase

**Network Isolation**
- Backend only accepts connections from localhost
- No outbound HTTP requests except to local Ollama instance
- Frontend configured with `http://localhost:3001` backend URL
- Works completely offline after initial Ollama model download

## Extension Points

### Adding Language Support
**File**: `backend/src/services/ast-parser.ts`
- Add parser plugin for target language (e.g., `@babel/plugin-syntax-jsx`)
- Update `parse()` options with new plugins array
- Extend `traverse()` visitor to handle language-specific nodes
- Add new node types to `shared/src/types.ts`

### Custom Visualizations
**File**: `backend/src/services/visualizer.ts`
- Implement new `generate*()` function that consumes `CodeStructure`
- Add visualization type to API response
- Create corresponding React component in `frontend/src/components/`
- Update `VisualizationPanel.tsx` to render new format

### Pedagogy Strategies
**File**: `backend/src/services/pedagogy.ts`
- Modify `buildPrompt()` to include new teaching approach
- Add mode detection logic based on user state
- Adjust Ollama parameters (temperature, top_p) for different strategies
- Update system prompt to guide model behavior

### Alternative LLM Integration
**Current**: Ollama HTTP API at localhost:11434
**To swap**:
1. Replace `fetch()` call in `pedagogy.ts` with new LLM client
2. Maintain same input (prompt string) and output (streamed tokens)
3. Update `models/README.md` with new setup instructions
4. Ensure new model supports streaming for real-time responses
