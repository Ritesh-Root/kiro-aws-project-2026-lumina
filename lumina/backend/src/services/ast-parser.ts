import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import crypto from 'crypto';
import type { CodeError, ASTNode, CodeStructure } from '@lumina/shared';

// LRU Cache for parsed ASTs
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

const astCache = new LRUCache<string, { ast: any; structure: CodeStructure }>(50);

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export interface ParseResult {
  ast: any;
  structure: CodeStructure;
  errors: CodeError[];
  success: boolean;
  cached: boolean;
}

export function parseJavaScript(code: string): ParseResult {
  const codeHash = hashCode(code);
  
  // Check cache
  const cached = astCache.get(codeHash);
  if (cached) {
    return {
      ast: cached.ast,
      structure: cached.structure,
      errors: [],
      success: true,
      cached: true
    };
  }

  const errors: CodeError[] = [];
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true
    });

    const structure = extractStructure(ast);
    
    // Cache result
    astCache.set(codeHash, { ast, structure });

    return {
      ast,
      structure,
      errors,
      success: true,
      cached: false
    };
  } catch (err: any) {
    errors.push({
      type: 'syntax',
      message: err.message,
      line: err.loc?.line || 0,
      column: err.loc?.column || 0,
      code: code.split('\n')[err.loc?.line - 1] || '',
      suggestion: generateSuggestion(err)
    });

    return {
      ast: null,
      structure: {
        functions: [],
        variables: [],
        classes: [],
        imports: [],
        callGraph: new Map()
      },
      errors,
      success: false,
      cached: false
    };
  }
}

function extractStructure(ast: any): CodeStructure {
  const functions: ASTNode[] = [];
  const variables: ASTNode[] = [];
  const classes: ASTNode[] = [];
  const imports: ASTNode[] = [];
  const callGraph = new Map<string, string[]>();
  
  let currentFunction: string | null = null;

  // Visitor pattern implementation
  traverse(ast, {
    FunctionDeclaration(path) {
      const node: ASTNode = {
        id: `func_${path.node.id?.name}_${path.node.loc?.start.line}`,
        type: 'FunctionDeclaration',
        name: path.node.id?.name || 'anonymous',
        loc: path.node.loc || undefined,
        params: path.node.params.map((p: any) => p.name || p.type),
        calls: [],
        scope: path.scope.uid
      };
      functions.push(node);
      currentFunction = node.name;
    },

    ArrowFunctionExpression(path) {
      const parent = path.parent;
      let name = 'anonymous';
      
      if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        name = parent.id.name;
      }

      const node: ASTNode = {
        id: `arrow_${name}_${path.node.loc?.start.line}`,
        type: 'ArrowFunctionExpression',
        name,
        loc: path.node.loc || undefined,
        params: path.node.params.map((p: any) => p.name || p.type),
        calls: [],
        scope: path.scope.uid
      };
      functions.push(node);
      currentFunction = name;
    },

    VariableDeclaration(path) {
      path.node.declarations.forEach((decl: any) => {
        if (decl.id.type === 'Identifier') {
          const node: ASTNode = {
            id: `var_${decl.id.name}_${path.node.loc?.start.line}`,
            type: 'VariableDeclaration',
            name: decl.id.name,
            loc: path.node.loc || undefined,
            scope: path.scope.uid,
            kind: path.node.kind as 'const' | 'let' | 'var'
          };
          variables.push(node);
        }
      });
    },

    ClassDeclaration(path) {
      const node: ASTNode = {
        id: `class_${path.node.id?.name}_${path.node.loc?.start.line}`,
        type: 'ClassDeclaration',
        name: path.node.id?.name || 'anonymous',
        loc: path.node.loc || undefined,
        scope: path.scope.uid
      };
      classes.push(node);
    },

    ImportDeclaration(path) {
      const node: ASTNode = {
        id: `import_${path.node.loc?.start.line}`,
        type: 'ImportDeclaration',
        name: path.node.source.value,
        loc: path.node.loc || undefined
      };
      imports.push(node);
    },

    CallExpression(path) {
      if (currentFunction && path.node.callee.type === 'Identifier') {
        const calleeName = path.node.callee.name;
        
        if (!callGraph.has(currentFunction)) {
          callGraph.set(currentFunction, []);
        }
        callGraph.get(currentFunction)!.push(calleeName);
      }
    }
  });

  return {
    functions,
    variables,
    classes,
    imports,
    callGraph
  };
}

function generateSuggestion(error: any): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('unexpected token')) {
    return 'Check for missing or extra brackets, parentheses, or semicolons';
  }
  if (message.includes('unexpected identifier')) {
    return 'You might have a typo or missing operator between expressions';
  }
  if (message.includes('unterminated')) {
    return 'Check for unclosed strings, comments, or brackets';
  }
  
  return 'Review the syntax at the indicated line';
}

export function clearCache(): void {
  astCache.clear();
}
