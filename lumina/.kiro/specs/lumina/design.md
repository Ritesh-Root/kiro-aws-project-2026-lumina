# Design Document: Lumina - The Local-First Multimodal Code Companion

## Overview

Lumina is a privacy-first, offline-capable AI teaching assistant that helps beginner developers learn programming through visual code representation, empathetic interaction, and adaptive Socratic pedagogy. The system architecture is built on three core pillars:

1. **Visual Runtime Engine**: Transforms code into interactive AST-based visualizations using Mermaid diagrams and React Flow
2. **Empathetic Voice Interface**: Provides hands-free interaction with sentiment analysis and adaptive audio feedback
3. **Adaptive Pedagogy Engine**: Delivers Socratic teaching through a locally-running LLM (Ollama)

The system operates entirely on the user's local machine, ensuring zero data transmission to external servers and enabling full offline functionality after initial setup.

### Design Philosophy

- **Privacy-First**: All processing happens locally; no cloud dependencies
- **Cognitive Load Reduction**: Visual representations reduce mental overhead for beginners
- **Adaptive Learning**: System adjusts teaching approach based on user sentiment and comprehension
- **Zero-Latency**: Local LLM provides instant responses without network delays
- **Multimodal**: Supports text, voice, and visual interaction modes

## AI Justification: Why LLM-Based Adaptive Pedagogy?

### The Limitations of Rule-Based Debugging Tools

Traditional debugging assistants (linters, static analyzers, IDE error messages) operate on predefined rules and pattern matching. While effective for catching syntax errors and common mistakes, they exhibit fundamental limitations for teaching:

**1. Fixed Error Messages**
- ESLint: "Unexpected token '}'" - states what's wrong, not why or how to fix it
- TypeScript: "Type 'string' is not assignable to type 'number'" - assumes user understands type systems
- Python: "IndentationError: expected an indented block" - doesn't explain indentation rules or context

**2. No Context Awareness**
- Rule-based tools analyze code in isolation without understanding user intent
- Cannot distinguish between a beginner making their first loop vs. an expert writing complex recursion
- Provide identical error messages regardless of user's learning stage or previous mistakes
- Cannot recognize when a user is stuck on the same concept across multiple attempts

**3. No Pedagogical Strategy**
- Tools provide answers, not guidance: "Add semicolon here" vs. "What terminates statements in JavaScript?"
- Cannot scaffold learning by breaking complex problems into smaller steps
- No ability to adjust explanation complexity based on user comprehension signals
- Cannot provide analogies, examples, or alternative explanations when initial approach fails

**4. Emotional Blindness**
- Cannot detect user frustration from repeated errors or increasingly desperate code changes
- No mechanism to provide encouragement or adjust tone during difficult learning moments
- Cannot recognize when to be more direct vs. when to maintain Socratic questioning
- Treat all users identically regardless of emotional state

**5. Rigid Interaction Model**
- Communication limited to error annotations and quick-fix suggestions
- No conversational ability to answer "why" questions or explore concepts
- Cannot engage in back-and-forth dialogue to probe understanding
- No support for open-ended questions like "How do closures work?"

### Example Comparison: Handling a Common Beginner Error

**Scenario**: User writes `if (x = 5)` instead of `if (x === 5)`

**ESLint (Rule-Based)**:
```
Expected '===' and instead saw '='. (eqeqeq)
```
- Identifies the pattern violation
- Suggests the fix
- Provides no explanation of assignment vs. comparison
- Doesn't check if user understands the difference

**Lumina (LLM-Based Adaptive Pedagogy)**:

*Initial Response (Low Frustration):*
```
I notice you're using a single = in your if statement. 
What's the difference between = and === in JavaScript?
```

*After User Struggles (Medium Frustration):*
```
Let's break this down: = assigns a value, while === compares values.
In your code, what do you think happens when you write x = 5 inside the if condition?
```

*After Multiple Attempts (High Frustration):*
```
I can see this is tricky! Here's what's happening:
- x = 5 assigns 5 to x and returns 5 (truthy)
- x === 5 compares x to 5 and returns true/false

Your if statement will always execute because x = 5 returns 5, which is truthy.
Try changing = to === to compare instead of assign.
```

### Why LLMs Enable Superior Teaching

**1. Natural Language Understanding**
- Parse user questions in any phrasing: "Why doesn't this work?" vs. "What's wrong with my loop?"
- Understand context from conversation history: "What about the other way?" references previous discussion
- Handle ambiguous queries by asking clarifying questions
- Recognize when users are asking about concepts vs. specific code issues

**2. Dynamic Response Generation**
- Generate explanations tailored to specific code context, not template responses
- Create custom analogies based on user's domain (e.g., cooking analogies for recipe app code)
- Provide multiple explanation strategies when initial approach doesn't resonate
- Synthesize information from code structure, errors, and conversation history

**3. Adaptive Complexity**
- Start with high-level concepts, drill down based on user questions
- Simplify language when detecting confusion markers in user responses
- Escalate from Socratic questions → hints → explanations based on attempt count
- Adjust technical vocabulary based on user's demonstrated knowledge level

**4. Contextual Code Examples**
- Generate examples that mirror user's code structure and variable names
- Show before/after comparisons specific to user's error
- Create runnable examples that demonstrate the concept in isolation
- Provide multiple examples with increasing complexity

**5. Emotional Intelligence**
- Detect frustration from text patterns: "I've tried everything", "this makes no sense"
- Adjust tone from challenging to supportive based on sentiment analysis
- Provide encouragement after successful problem-solving
- Recognize when to be more direct vs. maintain Socratic approach

**6. Conversational Memory**
- Remember previous explanations to avoid repetition
- Reference earlier concepts: "Remember when we talked about scope?"
- Track which teaching strategies worked for this user
- Build on previous understanding rather than starting from scratch each time

### Quantitative Advantages

| Capability | Rule-Based Tools | LLM-Based Lumina |
|------------|------------------|------------------|
| Error Detection | ✓ Excellent | ✓ Good (via AST) |
| Error Explanation | ✗ Template messages | ✓ Context-aware explanations |
| Concept Teaching | ✗ None | ✓ Socratic dialogue |
| Adaptation to User | ✗ None | ✓ Sentiment + history-based |
| Custom Examples | ✗ None | ✓ Generated per context |
| Follow-up Questions | ✗ None | ✓ Unlimited dialogue |
| Frustration Handling | ✗ None | ✓ Tone + complexity adjustment |
| Learning Scaffolding | ✗ None | ✓ Progressive hint system |
| Response Latency | ✓ <10ms | ✓ <3s (local LLM) |
| Privacy | ✓ Local | ✓ Local |

### Why Local LLM Specifically?

**Cloud-Based LLM Alternatives (ChatGPT, Claude API)**:
- Require internet connectivity - unusable in offline environments
- Introduce 200-500ms network latency per request
- Send user code to external servers - privacy concerns for proprietary/sensitive code
- Incur per-token costs that scale with usage
- Subject to rate limits and service availability

**Local LLM (Ollama + Llama-3-8B)**:
- Zero network latency: 1-3s response time on consumer hardware
- Complete privacy: code never leaves user's machine
- No usage costs after initial setup
- Works offline after model download
- No rate limits or service dependencies
- User maintains full control over model selection and parameters

**Performance Characteristics**:
- Llama-3-8B on M1 Mac: ~40 tokens/second
- Llama-3-8B on RTX 3060: ~60 tokens/second
- Gemma-7B (lighter alternative): ~70 tokens/second on same hardware
- Quantized models (4-bit): 2x faster with minimal quality loss

**Quantization Tradeoffs**:

| Model Variant | Size | Speed | Quality | Use Case |
|---------------|------|-------|---------|----------|
| Llama-3-8B (FP16) | 16GB | 40 tok/s | Excellent | High-end hardware (32GB+ RAM) |
| Llama-3-8B (8-bit) | 8GB | 50 tok/s | Very Good | Recommended (16GB+ RAM) |
| Llama-3-8B (4-bit) | 4.5GB | 80 tok/s | Good | Budget hardware (8GB+ RAM) |
| Gemma-7B (4-bit) | 4GB | 90 tok/s | Good | Minimum spec (8GB RAM) |

**Quality Impact of Quantization**:
- **8-bit**: <2% accuracy loss, imperceptible in teaching scenarios
- **4-bit**: 5-8% accuracy loss, occasional awkward phrasing but pedagogically sound
- **Recommendation**: 8-bit for optimal experience, 4-bit for resource-constrained systems

**Memory Footprint**:
- Model: 4-8GB (depending on quantization)
- Ollama runtime: 500MB
- Application (frontend + backend): 200MB
- Browser: 500MB
- **Total**: 5.2-9.2GB minimum system requirement

**Hardware Recommendations**:
- **Minimum**: 8GB RAM, 4-core CPU, 10GB disk space (4-bit Gemma)
- **Recommended**: 16GB RAM, 6-core CPU or GPU, 20GB disk space (8-bit Llama-3)
- **Optimal**: 32GB RAM, RTX 3060 or M1 Pro, 30GB disk space (FP16 Llama-3)

### The Hybrid Approach: Best of Both Worlds

Lumina combines rule-based AST analysis with LLM-based pedagogy:

**AST Parser (Rule-Based)** handles:
- Fast syntax error detection (<50ms)
- Code structure extraction for visualization
- Precise line/column error locations
- Deterministic parsing results

**LLM Pedagogy Engine** handles:
- Natural language interaction
- Adaptive teaching strategies
- Contextual explanations
- Emotional support

This architecture ensures:
- Instant visual feedback from AST parsing
- Rich pedagogical interaction from LLM
- Reliable error detection without LLM hallucination
- Privacy-preserving local processing

### Conclusion

Rule-based debugging tools excel at identifying what's wrong but fail at teaching why and how to fix it. LLM-based adaptive pedagogy systems like Lumina provide the conversational flexibility, contextual awareness, and emotional intelligence necessary for effective teaching. By running locally via Ollama, Lumina delivers these advantages without sacrificing privacy or requiring internet connectivity, making it uniquely suited for beginner developers who need patient, adaptive guidance rather than terse error messages.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Code Editor  │  │ Visualization│  │   Pedagogy   │      │
│  │  Component   │  │    Canvas    │  │     Panel    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴───────┐    │
│  │           Voice Interface & Sentiment UI            │    │
│  └──────────────────────────┬──────────────────────────┘    │
└─────────────────────────────┼─────────────────────────────┘
                              │ HTTP/REST API
┌─────────────────────────────┼─────────────────────────────┐
│                    Backend (Node.js/Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ AST Parser & │  │  Sentiment   │  │   Pedagogy   │    │
│  │  Visualizer  │  │   Analyzer   │  │    Engine    │    │
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

### Technology Stack

**Frontend:**
- React 18 with TypeScript for type-safe UI development
- Vite for fast development and optimized production builds
- React Flow for interactive node-based visualizations
- Mermaid.js for declarative diagram generation
- Web Speech API for voice recognition and synthesis
- Axios for HTTP client communication
- Local Storage API for session persistence

**Backend:**
- Node.js with Express for REST API server
- TypeScript for type safety across the stack
- Babel Parser (@babel/parser) for JavaScript AST generation
- Acorn for alternative JavaScript parsing
- Python AST (ast module via child process) for Python support
- Sentiment.js for text-based emotion analysis
- Ollama SDK for local LLM integration

**AI/ML:**
- Ollama as the local LLM runtime
- Llama-3-8B as the primary language model
- Gemma as an alternative lightweight model
- Quantized models for resource-constrained environments

**Shared:**
- TypeScript types shared between frontend and backend
- npm workspaces for monorepo management

## Components and Interfaces

### Frontend Components

#### 1. CodeEditor Component

**Purpose**: Provides the text editing interface for users to write and modify code.

**Key Features:**
- Syntax highlighting for JavaScript and Python
- Line numbers and error indicators
- Auto-save with 30-second debounce
- Keyboard shortcuts for common operations
- Accessibility support with ARIA labels

**Props Interface:**
```typescript
interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: 'javascript' | 'python';
  errors?: CodeError[];
  onErrorClick?: (error: CodeError) => void;
}
```

**State Management:**
- Local state for cursor position and selection
- Debounced updates to parent component
- Error highlighting state

**Integration Points:**
- Sends code to VisualizationPanel for AST generation
- Receives error information from backend
- Triggers auto-save to local storage

#### 2. VisualizationPanel Component

**Purpose**: Displays interactive visual representations of code structure.

**Key Features:**
- Mermaid diagram rendering for code flow
- React Flow nodes for interactive exploration
- Hover interactions to highlight corresponding code
- Zoom and pan controls
- Progressive rendering for large code files

**Props Interface:**
```typescript
interface VisualizationPanelProps {
  code: string;
  language: 'javascript' | 'python';
  onNodeClick?: (node: VisualizationNode) => void;
  onNodeHover?: (node: VisualizationNode | null) => void;
}
```

**State Management:**
- Visualization data (nodes and edges)
- Loading state during AST processing
- Zoom level and viewport position
- Selected node state

**Integration Points:**
- Calls backend `/api/visualize` endpoint with code
- Receives VisualizationNode[] and mermaid diagram
- Communicates with CodeEditor for code highlighting

#### 3. PedagogyPanel Component

**Purpose**: Displays AI-generated teaching responses and manages conversation flow.

**Key Features:**
- Chat-style conversation interface
- Streaming text responses
- Code snippet rendering with syntax highlighting
- Follow-up question suggestions
- Conversation history with scroll management

**Props Interface:**
```typescript
interface PedagogyPanelProps {
  code: string;
  frustrationLevel: number;
  onQuestionSubmit?: (question: string) => void;
}
```

**State Management:**
- Conversation history (up to 10 exchanges)
- Current streaming response
- Loading state
- Input field state

**Integration Points:**
- Calls backend `/api/pedagogy` endpoint
- Receives PedagogyResponse with type and content
- Integrates with VoiceInterface for audio output
- Considers frustration level for response adaptation

#### 4. FrustrationMeter Component

**Purpose**: Visualizes user emotional state based on sentiment analysis.

**Key Features:**
- Visual gauge from calm to frustrated
- Color-coded levels (green/yellow/red)
- Smooth transitions between states
- Tooltip with sentiment explanation

**Props Interface:**
```typescript
interface FrustrationMeterProps {
  level: number; // 0-100
  sentiment?: SentimentAnalysis;
}
```

**State Management:**
- Current frustration level
- Animation state for transitions

**Integration Points:**
- Receives updates from sentiment analysis
- Purely presentational component

#### 5. VoiceInterface Component

**Purpose**: Manages voice input and output for hands-free interaction.

**Key Features:**
- Microphone button with recording indicator
- Speech-to-text transcription display
- Text-to-speech playback controls
- Browser compatibility detection
- Noise level indicator

**Props Interface:**
```typescript
interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  onFrustrationChange: (level: number) => void;
  responseText?: string;
  autoPlay?: boolean;
}
```

**State Management:**
- Recording state (idle/listening/processing)
- Transcription text
- Audio playback state
- Browser support detection

**Integration Points:**
- Uses Web Speech API (SpeechRecognition and SpeechSynthesis)
- Sends transcribed text to PedagogyPanel
- Analyzes voice tone for sentiment (future enhancement)
- Receives response text for audio playback

### Backend Services

#### 1. AST Parser Service

**Purpose**: Parses code into Abstract Syntax Trees for analysis and visualization.

**Module**: `backend/src/services/ast-parser.ts`

**Key Functions:**

```typescript
interface ASTParserService {
  parseJavaScript(code: string): ParseResult;
  parsePython(code: string): ParseResult;
  extractFunctions(ast: any): FunctionNode[];
  extractVariables(ast: any): VariableNode[];
  extractControlFlow(ast: any): FlowNode[];
  detectErrors(code: string): CodeError[];
}

interface ParseResult {
  ast: any;
  errors: CodeError[];
  success: boolean;
}
```

**Implementation Details:**
- Uses @babel/parser for JavaScript with error recovery
- Spawns Python subprocess for Python AST generation
- Implements visitor pattern for AST traversal
- Caches parse results with code hash for performance
- Handles partial parsing for syntax errors

**AST Traversal Strategy**:
```typescript
// Visitor pattern implementation
const visitors = {
  FunctionDeclaration(path) {
    // Extract function name, parameters, return type
    functions.push({
      name: path.node.id.name,
      params: path.node.params.map(p => p.name),
      loc: path.node.loc,
      body: path.node.body
    });
  },
  VariableDeclaration(path) {
    // Track variable scope and lifecycle
    path.node.declarations.forEach(decl => {
      variables.push({
        name: decl.id.name,
        scope: path.scope.uid,
        kind: path.node.kind, // const/let/var
        init: decl.init
      });
    });
  },
  CallExpression(path) {
    // Build function call graph
    callGraph.addEdge(currentFunction, path.node.callee.name);
  }
};

traverse(ast, visitors);
```

**Caching Strategy**:
- Hash code with SHA-256
- Store AST in LRU cache (max 50 entries)
- Invalidate on code change
- Cache hit rate target: >80% during active coding

**Error Handling:**
- Catches and formats syntax errors with line/column info
- Provides error recovery for partial AST generation
- Returns descriptive error messages for beginners

#### 2. Visualizer Service

**Purpose**: Converts AST into visual representations (Mermaid diagrams and React Flow nodes).

**Module**: `backend/src/services/visualizer.ts`

**Key Functions:**

```typescript
interface VisualizerService {
  generateVisualization(ast: any, language: string): VisualizationData;
  generateMermaidDiagram(ast: any): string;
  generateReactFlowNodes(ast: any): VisualizationNode[];
  generateReactFlowEdges(nodes: VisualizationNode[]): VisualizationEdge[];
  layoutNodes(nodes: VisualizationNode[]): VisualizationNode[];
}

interface VisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  mermaidDiagram: string;
}
```

**Implementation Details:**
- Generates Mermaid flowchart syntax from AST
- Creates React Flow nodes with hierarchical layout
- Implements automatic node positioning algorithm
- Handles different node types (function, variable, control flow)
- Optimizes for readability with spacing and grouping

**AST to Mermaid Transformation Pipeline**:

```typescript
// Step 1: Extract nodes from AST
const nodes = extractNodes(ast); // [{type: 'function', name: 'foo', calls: ['bar']}]

// Step 2: Build Mermaid syntax
function generateMermaid(nodes: ASTNode[]): string {
  let mermaid = 'graph TD\n';
  
  // Add function nodes
  nodes.filter(n => n.type === 'function').forEach(fn => {
    mermaid += `  ${fn.id}["${fn.name}(${fn.params.join(', ')})"]\n`;
  });
  
  // Add variable nodes
  nodes.filter(n => n.type === 'variable').forEach(v => {
    mermaid += `  ${v.id}[("${v.name}: ${v.kind}")]\n`;
  });
  
  // Add edges (function calls)
  nodes.forEach(node => {
    node.calls?.forEach(callee => {
      mermaid += `  ${node.id} --> ${callee}\n`;
    });
  });
  
  // Add variable references
  nodes.forEach(node => {
    node.uses?.forEach(varName => {
      mermaid += `  ${node.id} -.-> ${varName}\n`;
    });
  });
  
  return mermaid;
}

// Step 3: Handle edge cases
// - Circular dependencies: Detect cycles, add warning annotation
// - Deeply nested code: Collapse nodes beyond depth 3
// - Large files: Limit to 50 nodes, show "... N more functions"
```

**Layout Algorithm**:
- Hierarchical layout: Entry point at top, callees below
- Dagre algorithm for automatic positioning
- Collision detection with 50px minimum spacing
- Group related functions by module/class

**Visualization Strategies:**
- Functions: Show call hierarchy and parameters
- Variables: Display scope and lifecycle
- Control Flow: Represent branches and loops
- Errors: Highlight problematic nodes in red

#### 3. Sentiment Analyzer Service

**Purpose**: Analyzes user text and voice input for emotional state.

**Module**: `backend/src/services/sentiment.ts`

**Key Functions:**

```typescript
interface SentimentAnalyzerService {
  analyzeText(text: string): SentimentAnalysis;
  analyzeTrend(history: string[]): SentimentTrend;
  calculateFrustrationLevel(sentiment: SentimentAnalysis): number;
  detectConfusionMarkers(text: string): boolean;
}

interface SentimentTrend {
  direction: 'improving' | 'declining' | 'stable';
  confidence: number;
}
```

**Implementation Details:**
- Uses sentiment.js library for base sentiment scoring
- Implements custom frustration markers (e.g., "I don't understand", "this doesn't work")
- Tracks sentiment over conversation history
- Normalizes scores to 0-100 frustration scale
- Detects confusion patterns (repeated questions, negative language)

**Frustration Detection Algorithm**:

```typescript
function calculateFrustration(text: string, history: string[]): number {
  // Base sentiment score (-1 to 1)
  const baseSentiment = sentiment.analyze(text).score;
  
  // Keyword matching with weights
  const frustrationKeywords = {
    'confused': 15,
    'stuck': 20,
    'frustrated': 25,
    "doesn't work": 20,
    "not working": 20,
    "I don't understand": 25,
    "makes no sense": 30,
    "tried everything": 35,
    "giving up": 40
  };
  
  let keywordScore = 0;
  Object.entries(frustrationKeywords).forEach(([keyword, weight]) => {
    if (text.toLowerCase().includes(keyword)) {
      keywordScore += weight;
    }
  });
  
  // Repetition detection (asking same question multiple times)
  const repetitionPenalty = detectRepetition(text, history) * 15;
  
  // Message length (over-explaining indicates confusion)
  const lengthPenalty = text.length > 200 ? 10 : 0;
  
  // Caps lock and exclamation marks (emotional intensity)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const intensityPenalty = (capsRatio > 0.3 ? 10 : 0) + (exclamationCount * 5);
  
  // Combine scores (0-100 scale)
  const rawScore = (
    (1 - baseSentiment) * 25 +  // Convert -1..1 to 0..50
    keywordScore +
    repetitionPenalty +
    lengthPenalty +
    intensityPenalty
  );
  
  return Math.min(100, Math.max(0, rawScore));
}

function detectRepetition(text: string, history: string[]): number {
  // Use Levenshtein distance to detect similar questions
  const recentMessages = history.slice(-5);
  let maxSimilarity = 0;
  
  recentMessages.forEach(msg => {
    const similarity = levenshteinSimilarity(text, msg);
    if (similarity > maxSimilarity) maxSimilarity = similarity;
  });
  
  return maxSimilarity > 0.7 ? 1 : 0; // Binary: repeated or not
}
```

**Frustration Indicators:**
- Negative sentiment words: "confused", "stuck", "frustrated"
- Repeated similar questions
- Increasing message length (over-explaining)
- Exclamation marks and caps lock usage

#### 4. Pedagogy Engine Service

**Purpose**: Generates Socratic teaching responses using local LLM.

**Module**: `backend/src/services/pedagogy.ts`

**Key Functions:**

```typescript
interface PedagogyEngineService {
  generateResponse(request: PedagogyRequest): Promise<PedagogyResponse>;
  buildPrompt(request: PedagogyRequest): string;
  adaptToFrustration(response: string, level: number): string;
  generateFollowUpQuestions(context: string): string[];
  selectResponseType(request: PedagogyRequest): ResponseType;
}

interface PedagogyRequest {
  userQuestion: string;
  code: string;
  errors?: CodeError[];
  conversationHistory: ConversationTurn[];
  frustrationLevel: number;
  attemptCount: number;
}

type ResponseType = 'socratic_question' | 'hint' | 'explanation' | 'encouragement';
```

**Implementation Details:**
- Integrates with Ollama SDK for LLM communication
- Constructs context-aware prompts with code and errors
- Implements response type selection based on frustration and attempts
- Adapts language complexity based on user comprehension
- Maintains conversation context (last 10 turns)
- Streams responses for better UX

**Prompt Engineering:**
- System prompt defines Socratic teaching role
- Includes code context and error information
- Adjusts directness based on frustration level
- Provides examples of good teaching responses
- Constrains response length for readability

**Prompt Engineering Strategy**:

```typescript
function buildPrompt(request: PedagogyRequest): string {
  const { code, errors, frustrationLevel, conversationHistory, userQuestion } = request;
  
  // Select teaching mode based on frustration
  const mode = selectTeachingMode(frustrationLevel);
  
  // Build system prompt
  const systemPrompt = `You are Lumina, a patient coding teacher for absolute beginners.

Teaching Philosophy:
- Use the Socratic method: guide with questions, don't give direct answers
- Adapt to user frustration: ${mode.description}
- Break complex concepts into small, digestible steps
- Use analogies and examples from everyday life
- Celebrate small wins and encourage persistence

Current Mode: ${mode.name}
Directness Level: ${mode.directness}/10
`;

  // Add code context
  const codeContext = code ? `
Student's Code:
\`\`\`javascript
${code}
\`\`\`
` : '';

  // Add error context
  const errorContext = errors?.length ? `
Errors Detected:
${errors.map(e => `- Line ${e.line}: ${e.message}`).join('\n')}
` : '';

  // Add conversation history (last 3 turns for context)
  const historyContext = conversationHistory.slice(-3).map(turn => 
    `${turn.role === 'user' ? 'Student' : 'Lumina'}: ${turn.content}`
  ).join('\n\n');

  // Construct final prompt
  return `${systemPrompt}

${codeContext}
${errorContext}

Previous Conversation:
${historyContext}

Student's Question: ${userQuestion}

Respond as Lumina. ${mode.instruction}`;
}

function selectTeachingMode(frustrationLevel: number) {
  if (frustrationLevel < 30) {
    return {
      name: 'Socratic Explorer',
      directness: 3,
      description: 'Student is calm and engaged. Use pure Socratic questioning.',
      instruction: 'Ask a guiding question that helps them discover the answer.'
    };
  } else if (frustrationLevel < 70) {
    return {
      name: 'Supportive Guide',
      directness: 6,
      description: 'Student is showing some frustration. Provide hints with questions.',
      instruction: 'Give a specific hint, then ask a question to confirm understanding.'
    };
  } else {
    return {
      name: 'Direct Mentor',
      directness: 9,
      description: 'Student is highly frustrated. Provide clear explanations with encouragement.',
      instruction: 'Explain the solution clearly, show why it works, and encourage them.'
    };
  }
}
```

**Context Window Management**:
- Limit conversation history to last 10 turns (≈2000 tokens)
- Truncate code to 500 lines (≈10,000 tokens)
- Total context budget: 12,000 tokens (leaves 4,000 for response)
- If context exceeds budget: summarize older turns, keep recent 3 turns verbatim

**Response Constraints**:
- Max length: 300 tokens (≈200 words)
- If explanation requires more: break into multiple messages
- Include code examples only when directly relevant
- Avoid jargon unless previously explained

**Response Adaptation:**
- Low frustration (0-30%): Pure Socratic questions
- Medium frustration (31-70%): Mix of questions and hints
- High frustration (71-100%): Direct explanations with encouragement

#### 5. Ollama Client Service

**Purpose**: Manages communication with local Ollama LLM service.

**Module**: `backend/src/services/ollama-client.ts`

**Key Functions:**

```typescript
interface OllamaClientService {
  checkConnection(): Promise<boolean>;
  listModels(): Promise<string[]>;
  generateCompletion(prompt: string, model: string): Promise<string>;
  streamCompletion(prompt: string, model: string): AsyncGenerator<string>;
  getModelInfo(model: string): Promise<ModelInfo>;
}

interface ModelInfo {
  name: string;
  size: string;
  quantization: string;
  parameters: number;
}
```

**Implementation Details:**
- Uses Ollama REST API (http://localhost:11434)
- Implements connection health checks
- Supports streaming and non-streaming completions
- Handles model switching
- Provides error messages for setup issues
- Implements retry logic for transient failures

**Error Handling:**
- Detects when Ollama is not running
- Provides setup instructions in error messages
- Falls back gracefully when models are unavailable
- Validates model compatibility

## Data Models

### Core Data Types

#### CodeError
```typescript
interface CodeError {
  type: 'syntax' | 'runtime' | 'logical';
  message: string;
  line: number;
  column: number;
  code: string;
  stackTrace?: string;
  suggestion?: string;
}
```

**Purpose**: Represents errors detected in user code.

**Usage**: Passed from AST parser to visualization and pedagogy components.

#### VisualizationNode
```typescript
interface VisualizationNode {
  id: string;
  type: 'variable' | 'function' | 'error' | 'flow' | 'class' | 'import';
  label: string;
  data: {
    name: string;
    scope?: string;
    parameters?: string[];
    returnType?: string;
    value?: any;
    lineNumber?: number;
  };
  position: { x: number; y: number };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}
```

**Purpose**: Represents a single node in the code visualization graph.

**Usage**: Generated by visualizer service, rendered by VisualizationPanel.

#### VisualizationEdge
```typescript
interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'step' | 'smoothstep' | 'straight';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}
```

**Purpose**: Represents connections between visualization nodes.

**Usage**: Shows relationships like function calls, variable references, control flow.

#### SentimentAnalysis
```typescript
interface SentimentAnalysis {
  score: number; // -1 (very negative) to 1 (very positive)
  magnitude: number; // 0 (neutral) to 1 (strong emotion)
  frustrationLevel: 'low' | 'medium' | 'high';
  frustrationScore: number; // 0-100
  markers: string[]; // Detected frustration indicators
  trend?: 'improving' | 'declining' | 'stable';
}
```

**Purpose**: Captures user emotional state from text analysis.

**Usage**: Drives UI updates (FrustrationMeter) and pedagogy adaptation.

#### PedagogyResponse
```typescript
interface PedagogyResponse {
  type: 'hint' | 'question' | 'explanation' | 'encouragement';
  content: string;
  codeExamples?: CodeExample[];
  followUpQuestions?: string[];
  relatedConcepts?: string[];
  documentationLinks?: string[];
}

interface CodeExample {
  code: string;
  language: string;
  explanation: string;
  runnable: boolean;
}
```

**Purpose**: Encapsulates AI-generated teaching responses.

**Usage**: Displayed in PedagogyPanel, optionally converted to speech.

#### ConversationTurn
```typescript
interface ConversationTurn {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  sentiment?: SentimentAnalysis;
  responseType?: string;
}
```

**Purpose**: Represents a single exchange in the conversation history.

**Usage**: Maintains context for pedagogy engine, stored in session.

#### Session
```typescript
interface Session {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  language: 'javascript' | 'python';
  conversationHistory: ConversationTurn[];
  settings: UserSettings;
}

interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  voiceEnabled: boolean;
  socratiIntensity: 'low' | 'medium' | 'high';
  selectedModel: string;
  autoSave: boolean;
}
```

**Purpose**: Persists user session data for continuity.

**Usage**: Saved to local storage, restored on app load.

### API Request/Response Models

#### POST /api/visualize
**Request:**
```typescript
interface VisualizeRequest {
  code: string;
  language: 'javascript' | 'python';
}
```

**Response:**
```typescript
interface VisualizeResponse {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  mermaidDiagram: string;
  errors: CodeError[];
  parseTime: number;
}
```

#### POST /api/pedagogy
**Request:**
```typescript
interface PedagogyRequest {
  userQuestion: string;
  code: string;
  language: 'javascript' | 'python';
  errors?: CodeError[];
  conversationHistory: ConversationTurn[];
  frustrationLevel: number;
}
```

**Response:**
```typescript
interface PedagogyResponse {
  type: 'hint' | 'question' | 'explanation' | 'encouragement';
  content: string;
  codeExamples?: CodeExample[];
  followUpQuestions?: string[];
  sentiment: SentimentAnalysis;
  processingTime: number;
}
```

#### POST /api/analyze
**Request:**
```typescript
interface AnalyzeRequest {
  text: string;
  conversationHistory?: string[];
}
```

**Response:**
```typescript
interface AnalyzeResponse {
  sentiment: SentimentAnalysis;
}
```

## Data Flow Patterns

### 1. Code Visualization Flow
```
User types code → CodeEditor debounces (300ms) → 
POST /api/visualize → AST Parser → Visualizer Service → 
VisualizationPanel receives nodes/edges → React Flow renders
```

### 2. Question-Answer Flow
```
User asks question → PedagogyPanel → POST /api/pedagogy → 
Sentiment Analyzer → Pedagogy Engine → Ollama LLM → 
Stream response → PedagogyPanel displays → 
Optional: VoiceInterface speaks response
```

### 3. Voice Interaction Flow
```
User clicks mic → Web Speech API listens → Transcription → 
VoiceInterface → PedagogyPanel (same as text) → 
Response generated → VoiceInterface speaks → 
Sentiment analyzed from tone (future)
```

### 4. Session Persistence Flow
```
Code changes → Auto-save timer (30s) → Local Storage write → 
App reload → Local Storage read → Restore session → 
Populate CodeEditor and conversation history
```

