# Lumina - Design Document

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Code Editor  │  │ Visualization│  │   Pedagogy   │      │
│  │  Component   │  │    Panel     │  │     Panel    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴───────┐    │
│  │      Voice Interface & Frustration Meter           │    │
│  └──────────────────────────┬──────────────────────────┘    │
└─────────────────────────────┼─────────────────────────────┘
                              │ REST API (HTTP/JSON)
┌─────────────────────────────┼─────────────────────────────┐
│              Backend (Node.js + Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ AST Parser   │  │  Sentiment   │  │   Pedagogy   │    │
│  │ + Visualizer │  │   Analyzer   │  │    Engine    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                                │
│                    ┌───────┴────────┐                      │
│                    │  Ollama Client │                      │
│                    └───────┬────────┘                      │
└────────────────────────────┼───────────────────────────────┘
                             │ HTTP (localhost:11434)
                    ┌────────┴─────────┐
                    │  Ollama Service  │
                    │ (Llama-3-8B/Gemma)│
                    └──────────────────┘
```

---

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe UI
- **Vite** for fast development and optimized builds
- **React Flow** for interactive node-based visualizations
- **Mermaid.js** for declarative diagram generation
- **Web Speech API** for voice recognition and synthesis
- **Axios** for HTTP client communication
- **Local Storage API** for session persistence

### Backend
- **Node.js** with Express for REST API server
- **TypeScript** for type safety across the stack
- **Babel Parser** (@babel/parser) for JavaScript AST generation
- **Sentiment.js** for text-based emotion analysis
- **Ollama SDK** for local LLM integration
- **Crypto** (SHA-256) for cache key hashing

### AI/ML
- **Ollama** as the local LLM runtime
- **Llama-3-8B** as the primary language model (8-bit quantization)
- **Gemma-7B** as an alternative lightweight model
- **Quantized models** (4-bit) for resource-constrained environments

---

## Core Services

### 1. AST Parser Service

**File**: `backend/src/services/ast-parser.ts`

**Purpose**: Parses JavaScript code into Abstract Syntax Trees for analysis and visualization.

**Key Features**:
- LRU cache with SHA-256 hashing (50 entries, >80% hit rate target)
- Visitor pattern for AST traversal
- Extracts functions, variables, classes, imports
- Builds call graph for function relationships
- Error recovery for partial AST generation

**Algorithm**:
```typescript
1. Hash code with SHA-256
2. Check LRU cache for existing AST
3. If cache miss:
   a. Parse code with @babel/parser
   b. Traverse AST with visitor pattern
   c. Extract nodes (functions, variables, classes)
   d. Build call graph
   e. Cache result
4. Return AST + structure
```

**Performance**:
- Parse time: 150-300ms typical (target: <500ms)
- Cache hit rate: >80% during active coding
- Memory: ~50MB for cache

---

### 2. Mermaid Visualizer Service

**File**: `backend/src/services/visualizer.ts`

**Purpose**: Converts AST into visual representations (Mermaid diagrams and React Flow nodes).

**Transformation Pipeline**:
```typescript
AST Structure
    ↓
Extract Nodes (functions, variables, classes)
    ↓
Generate Mermaid Syntax
    ├─ Function nodes: ["functionName(params)"]
    ├─ Variable nodes: [("varName: const")]
    └─ Edges: function calls and references
    ↓
Generate React Flow Nodes
    ├─ Position nodes with layout algorithm
    ├─ Style nodes by type (function/variable/class)
    └─ Create edges with animation
    ↓
Return: { nodes, edges, mermaidDiagram }
```

**Edge Cases**:
- Circular dependencies: Detect cycles, add warning
- Deeply nested code: Collapse nodes beyond depth 3
- Large files: Limit to 50 nodes, show "... N more"

**Performance**:
- Generation time: 50-100ms typical (target: <200ms)
- Max nodes: 50 (for readability)

---

### 3. Sentiment Analyzer Service

**File**: `backend/src/services/sentiment.ts`

**Purpose**: Analyzes user text for emotional state and calculates frustration score.

**Frustration Detection Algorithm**:
```typescript
frustrationScore = 
  (1 - baseSentiment) * 25 +     // Base sentiment (-1..1 → 0..50)
  keywordScore +                  // Weighted keywords (0-40)
  repetitionPenalty +             // Levenshtein distance (0-15)
  lengthPenalty +                 // Message length (0-10)
  intensityPenalty                // Caps/exclamations (0-15)

// Normalize to 0-100
frustrationScore = Math.min(100, Math.max(0, frustrationScore))
```

**Keyword Weights**:
```typescript
{
  'confused': 15,
  'stuck': 20,
  'frustrated': 25,
  "doesn't work": 20,
  "I don't understand": 25,
  "makes no sense": 30,
  "tried everything": 35,
  "giving up": 40
}
```

**Thresholds**:
- 0-30%: Low frustration → Socratic questions
- 31-70%: Medium frustration → Hints + questions
- 71-100%: High frustration → Direct explanations

**Performance**:
- Analysis time: <100ms
- Accuracy: ~85% (internal testing)

---

### 4. Pedagogy Engine Service

**File**: `backend/src/services/pedagogy.ts`

**Purpose**: Generates Socratic teaching responses using local LLM.

**Teaching Modes**:

| Mode | Frustration | Directness | Strategy |
|------|-------------|------------|----------|
| Socratic Explorer | 0-30% | 3/10 | Pure questions, no answers |
| Supportive Guide | 31-70% | 6/10 | Hints + guiding questions |
| Direct Mentor | 71-100% | 9/10 | Clear explanations + encouragement |

**Prompt Engineering**:
```typescript
System Prompt:
  "You are Lumina, a patient coding teacher.
   Teaching Mode: {mode.name}
   Directness: {mode.directness}/10
   Strategy: {mode.description}
   {mode.instruction}"

User Prompt:
  "Student's Code: {code}
   Errors: {errors}
   Previous Conversation: {history}
   Student's Question: {question}
   
   Respond as Lumina:"
```

**Context Window Management**:
- Total budget: 12,000 tokens
- Code: Up to 500 lines (~10,000 tokens)
- History: Last 10 turns (~2,000 tokens)
- Response: Max 300 tokens (~200 words)

**LLM Parameters**:
- Model: `llama3` (8B parameters)
- Temperature: 0.9 (calm) → 0.7 (frustrated)
- Max tokens: 300
- Stream: true (for real-time responses)

**Performance**:
- First token: 800ms-1.2s typical (target: <1s)
- Streaming: 40-60 tokens/second
- Total response: 2-3s for 200 words

---

## Data Flow Patterns

### 1. Code Visualization Flow

```
User types code in CodeEditor
    ↓ [debounce 300ms]
POST /api/visualize { code, language }
    ↓
AST Parser Service
    ├─ Check cache (SHA-256 hash)
    ├─ Parse with @babel/parser
    ├─ Traverse with visitor pattern
    └─ Extract structure
    ↓
Visualizer Service
    ├─ Generate Mermaid diagram
    ├─ Generate React Flow nodes
    └─ Apply layout algorithm
    ↓
Response: { nodes, edges, mermaidDiagram, errors, parseTime }
    ↓
VisualizationPanel renders diagrams
```

### 2. Sentiment Analysis Flow

```
User submits text (chat or voice)
    ↓
POST /api/analyze { text, conversationHistory }
    ↓
Sentiment Analyzer Service
    ├─ Base sentiment (sentiment.js)
    ├─ Keyword matching (weighted)
    ├─ Repetition detection (Levenshtein)
    ├─ Length & intensity penalties
    └─ Calculate 0-100 score
    ↓
Response: { sentiment: { score, frustrationLevel, markers } }
    ↓
FrustrationMeter updates visual indicator
```

### 3. Adaptive Teaching Flow

```
User asks question
    ↓
Sentiment analysis (see flow above)
    ↓
POST /api/pedagogy { 
  userQuestion, 
  code, 
  errors, 
  conversationHistory, 
  frustrationLevel 
}
    ↓
Pedagogy Engine Service
    ├─ Select teaching mode (based on frustration)
    ├─ Build system prompt
    ├─ Build user prompt (code + context)
    ├─ Call Ollama LLM
    └─ Stream response tokens
    ↓
Response: { type, content, followUpQuestions }
    ↓
PedagogyPanel displays response
    ↓ [optional]
VoiceInterface speaks response (text-to-speech)
```

---

## API Endpoints

### POST /api/visualize

**Request**:
```json
{
  "code": "function hello() { return 'world'; }",
  "language": "javascript"
}
```

**Response**:
```json
{
  "nodes": [
    {
      "id": "func_hello_1",
      "type": "function",
      "label": "hello()",
      "data": { "name": "hello", "parameters": [], "lineNumber": 1 },
      "position": { "x": 100, "y": 100 }
    }
  ],
  "edges": [],
  "mermaidDiagram": "graph TD\n  func_hello_1[\"hello()\"]\n",
  "errors": [],
  "parseTime": 245
}
```

### POST /api/analyze

**Request**:
```json
{
  "text": "I am so confused and stuck",
  "conversationHistory": []
}
```

**Response**:
```json
{
  "sentiment": {
    "score": -0.6,
    "magnitude": 0.6,
    "frustrationLevel": "high",
    "frustrationScore": 75,
    "markers": ["confused", "stuck"],
    "trend": "stable"
  }
}
```

### POST /api/pedagogy

**Request**:
```json
{
  "userQuestion": "What does this error mean?",
  "code": "if (x = 5) {}",
  "language": "javascript",
  "errors": [],
  "conversationHistory": [],
  "frustrationLevel": 30
}
```

**Response**:
```json
{
  "type": "question",
  "content": "I notice you're using a single = in your if statement. What's the difference between = and === in JavaScript?",
  "followUpQuestions": [
    "What does the = operator do?",
    "What does the === operator do?"
  ],
  "relatedConcepts": ["assignment", "comparison", "operators"]
}
```

---

## Performance Optimization

### Caching Strategy

**AST Cache**:
- Type: LRU (Least Recently Used)
- Size: 50 entries
- Key: SHA-256 hash of code
- Hit rate target: >80%
- Memory: ~50MB

**Cache Invalidation**:
- On code change (hash changes)
- Manual clear via API (for testing)

### Debouncing

**Code Editor**:
- Debounce: 300ms
- Prevents excessive parsing during typing
- Improves UI responsiveness

**Sentiment Analysis**:
- No debounce (instant feedback)
- Analysis is fast (<100ms)

### Streaming

**LLM Responses**:
- Server-Sent Events (SSE)
- Tokens streamed as generated
- Improves perceived performance
- User sees response building in real-time

---

## Security Considerations

### Input Validation

**Code Input**:
- Max length: 10,000 characters
- Sanitize before visualization (escape HTML)
- Prevent XSS in Mermaid diagrams

**Text Input**:
- Max length: 1,000 characters
- Sanitize before sentiment analysis
- No SQL injection risk (no database)

### LLM Safety

**Prompt Injection Prevention**:
- Validate LLM responses
- Filter harmful content
- Timeout after 10 seconds
- Fallback to safe responses

**Rate Limiting**:
- Max 10 requests/minute per session
- Prevents abuse of local resources

---

## Error Handling

### AST Parsing Errors

```typescript
try {
  ast = parse(code);
} catch (error) {
  return {
    errors: [{
      type: 'syntax',
      message: error.message,
      line: error.loc.line,
      suggestion: generateSuggestion(error)
    }],
    success: false
  };
}
```

### Ollama Connection Errors

```typescript
try {
  response = await ollama.chat(...);
} catch (error) {
  return {
    type: 'hint',
    content: getFallbackResponse(frustrationLevel),
    followUpQuestions: [
      'What do you think is happening?',
      'Have you seen this before?'
    ]
  };
}
```

### Graceful Degradation

- Ollama not running → Show setup instructions
- Browser API unavailable → Disable voice features
- Parsing fails → Show partial visualization
- LLM timeout → Use fallback responses

---

## Deployment Architecture

### Development

```
Frontend: http://localhost:5173 (Vite dev server)
Backend: http://localhost:3001 (Express server)
Ollama: http://localhost:11434 (LLM service)
```

### Production

```
Frontend: Static files served by nginx/serve
Backend: Node.js process (PM2 or systemd)
Ollama: System service (systemd)
```

---

## Monitoring & Logging

### Performance Metrics

- AST parse time (target: <500ms)
- Mermaid generation time (target: <200ms)
- LLM first token time (target: <1s)
- LLM streaming rate (target: >30 tok/s)
- Cache hit rate (target: >80%)

### Error Logging

- Backend: Console logs (development)
- Backend: File logs (production)
- Frontend: Browser console
- No external logging services (privacy)

---

## Future Enhancements

### Phase 2
- Python AST support
- Control flow visualization
- Session persistence
- Model switching UI

### Phase 3
- Voice interface
- Advanced sentiment (ML model)
- Code examples library
- Performance dashboard

### Phase 4
- Multi-language support
- React Flow interactive graphs
- Collaborative features
- Mobile app

---

**Version**: 1.0  
**Last Updated**: February 15, 2026  
**Status**: MVP Complete - Backend Functional
