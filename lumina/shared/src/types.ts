// Core Data Types
export interface CodeError {
  type: 'syntax' | 'runtime' | 'logical';
  message: string;
  line: number;
  column: number;
  code: string;
  stackTrace?: string;
  suggestion?: string;
}

export interface VisualizationNode {
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

export interface VisualizationEdge {
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

export interface SentimentAnalysis {
  score: number; // -1 (very negative) to 1 (very positive)
  magnitude: number; // 0 (neutral) to 1 (strong emotion)
  frustrationLevel: 'low' | 'medium' | 'high';
  frustrationScore: number; // 0-100
  markers: string[]; // Detected frustration indicators
  trend?: 'improving' | 'declining' | 'stable';
}

export interface ConversationTurn {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  sentiment?: SentimentAnalysis;
  responseType?: string;
}

export interface CodeExample {
  code: string;
  language: string;
  explanation: string;
  runnable: boolean;
}

export interface PedagogyResponse {
  type: 'hint' | 'question' | 'explanation' | 'encouragement';
  content: string;
  followUpQuestions?: string[];
  codeExamples?: CodeExample[];
  relatedConcepts?: string[];
}

export interface PedagogyRequest {
  userQuestion: string;
  code: string;
  language: 'javascript' | 'python';
  errors?: CodeError[];
  conversationHistory: ConversationTurn[];
  frustrationLevel: number;
  attemptCount?: number;
}

// API Request/Response Models
export interface VisualizeRequest {
  code: string;
  language: 'javascript' | 'python';
}

export interface VisualizeResponse {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  mermaidDiagram: string;
  errors: CodeError[];
  parseTime: number;
}

export interface AnalyzeRequest {
  text: string;
  conversationHistory?: string[];
}

export interface AnalyzeResponse {
  sentiment: SentimentAnalysis;
}

// AST Node Types
export interface ASTNode {
  id: string;
  type: string;
  name: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  params?: string[];
  calls?: string[];
  uses?: string[];
  scope?: string;
  kind?: 'const' | 'let' | 'var';
}

export interface CodeStructure {
  functions: ASTNode[];
  variables: ASTNode[];
  classes: ASTNode[];
  imports: ASTNode[];
  callGraph: Map<string, string[]>;
}
