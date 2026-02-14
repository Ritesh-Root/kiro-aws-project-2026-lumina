# Contributing to Lumina

Thank you for your interest in contributing to Lumina! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building a tool to help beginners learn - let's model the patience and empathy we want Lumina to embody.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/yourusername/lumina/issues) first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System info (OS, Node version, Ollama version)
   - Screenshots if applicable

### Suggesting Features

1. Check [discussions](https://github.com/yourusername/lumina/discussions) first
2. Create a new discussion with:
   - Use case and motivation
   - Proposed solution
   - Alternatives considered
   - Impact on existing features

### Pull Requests

1. **Fork and clone**
   ```bash
   git clone https://github.com/yourusername/lumina.git
   cd lumina
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

3. **Make changes**
   - Follow code style (see below)
   - Add tests for new features
   - Update documentation
   - Keep commits atomic and well-described

4. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add sentiment trend visualization"
   git commit -m "fix: resolve AST parsing error for arrow functions"
   git commit -m "docs: update setup guide for Windows"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```
   Then create a pull request on GitHub.

## Development Setup

See [SETUP_DETAILED.md](SETUP_DETAILED.md) for complete setup instructions.

Quick start:
```bash
npm install
cd shared && npm run build && cd ..
npm run dev
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for objects
- Use explicit return types for functions
- Avoid `any` - use `unknown` if needed

```typescript
// Good
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}

// Avoid
function greet(user: any) {
  return `Hello, ${user.name}`;
}
```

### Naming Conventions

- **Files**: kebab-case (`ast-parser.ts`, `sentiment-analyzer.ts`)
- **Components**: PascalCase (`CodeEditor.tsx`, `FrustrationMeter.tsx`)
- **Functions**: camelCase (`parseCode`, `analyzeText`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CACHE_SIZE`, `DEFAULT_PORT`)
- **Interfaces**: PascalCase (`SentimentAnalysis`, `PedagogyRequest`)

### Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up-to-date

```typescript
/**
 * Analyzes text for emotional indicators and calculates frustration score.
 * 
 * Uses weighted keyword matching, repetition detection, and sentiment analysis
 * to produce a 0-100 frustration score.
 * 
 * @param text - User input text to analyze
 * @param conversationHistory - Previous messages for repetition detection
 * @returns Sentiment analysis with frustration score and detected markers
 */
export function analyzeText(text: string, conversationHistory: string[]): SentimentAnalysis {
  // Implementation
}
```

## Project Structure

```
lumina/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   └── tests/          # Frontend tests
│
├── backend/            # Node.js backend
│   ├── src/
│   │   ├── services/   # Core business logic
│   │   ├── routes/     # API endpoints
│   │   └── utils/      # Utility functions
│   └── tests/          # Backend tests
│
├── shared/             # Shared TypeScript types
│   └── src/
│       └── types.ts    # Type definitions
│
└── .kiro/specs/        # Specification documents
    └── lumina/
        ├── requirements.md
        └── design.md
```

## Testing Guidelines

### Unit Tests

- Test individual functions in isolation
- Mock external dependencies
- Aim for >80% code coverage

```typescript
describe('analyzeText', () => {
  it('should detect high frustration from keywords', () => {
    const result = analyzeText('I am so confused and stuck', []);
    expect(result.frustrationLevel).toBe('high');
    expect(result.markers).toContain('confused');
  });
});
```

### Integration Tests

- Test API endpoints end-to-end
- Use real services (not mocked)
- Test error cases

```typescript
describe('POST /api/analyze', () => {
  it('should return sentiment analysis', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ text: 'I am confused' });
    
    expect(response.status).toBe(200);
    expect(response.body.sentiment.frustrationScore).toBeGreaterThan(0);
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Update SETUP_DETAILED.md for setup changes
- Update .kiro/specs/ for architectural changes
- Add JSDoc comments for new public APIs

## Performance Considerations

- AST parsing should complete in <500ms
- Sentiment analysis should complete in <100ms
- LLM responses should stream (not block)
- Cache frequently accessed data
- Profile before optimizing

## Security Considerations

- Validate all user input
- Sanitize code before visualization
- Prevent XSS in Mermaid diagrams
- Limit request sizes (10MB max)
- No external network calls (except localhost Ollama)

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(pedagogy): add streaming response support

Implements server-sent events for real-time LLM responses.
Improves perceived performance by showing tokens as they arrive.

Closes #42
```

```
fix(ast-parser): handle arrow functions in class properties

Arrow functions assigned to class properties were not being
detected by the visitor pattern. Updated traversal logic to
handle ArrowFunctionExpression within ClassProperty nodes.

Fixes #38
```

## Review Process

1. **Automated checks** must pass:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests (Jest/Vitest)

2. **Code review** by maintainer:
   - Code quality and style
   - Test coverage
   - Documentation updates
   - Performance impact

3. **Approval and merge**:
   - Squash and merge for feature branches
   - Rebase and merge for hotfixes

## Questions?

- **General questions**: [GitHub Discussions](https://github.com/yourusername/lumina/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/yourusername/lumina/issues)
- **Security issues**: Email security@lumina.dev (do not create public issue)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Lumina! 🌟
