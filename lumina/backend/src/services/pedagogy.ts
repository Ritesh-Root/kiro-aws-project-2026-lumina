import Ollama from 'ollama';
import type { PedagogyRequest, PedagogyResponse, ConversationTurn } from '@lumina/shared';

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
const MODEL = process.env.MODEL_NAME || 'llama3';

interface TeachingMode {
  name: string;
  directness: number;
  description: string;
  instruction: string;
}

export async function generatePedagogyResponse(request: PedagogyRequest): Promise<PedagogyResponse> {
  const prompt = buildPrompt(request);
  const mode = selectTeachingMode(request.frustrationLevel);

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(mode) },
        { role: 'user', content: prompt }
      ],
      options: {
        temperature: mode.directness > 7 ? 0.7 : 0.9, // More deterministic when frustrated
        num_predict: 300 // Max 300 tokens
      }
    });

    const content = response.message.content;
    const responseType = determineResponseType(content, mode);

    return {
      type: responseType,
      content: content.trim(),
      followUpQuestions: extractFollowUpQuestions(content),
      relatedConcepts: extractConcepts(content)
    };
  } catch (error: any) {
    console.error('Ollama error:', error);
    
    // Fallback response
    return {
      type: 'hint',
      content: getFallbackResponse(request.frustrationLevel),
      followUpQuestions: [
        'What do you think is happening at this line?',
        'Have you seen a similar pattern before?'
      ]
    };
  }
}

function selectTeachingMode(frustrationLevel: number): TeachingMode {
  if (frustrationLevel < 30) {
    return {
      name: 'Socratic Explorer',
      directness: 3,
      description: 'Student is calm and engaged. Use pure Socratic questioning.',
      instruction: 'Ask a guiding question that helps them discover the answer. Do not give the solution directly.'
    };
  } else if (frustrationLevel < 70) {
    return {
      name: 'Supportive Guide',
      directness: 6,
      description: 'Student is showing some frustration. Provide hints with questions.',
      instruction: 'Give a specific hint about what to look for, then ask a question to confirm understanding.'
    };
  } else {
    return {
      name: 'Direct Mentor',
      directness: 9,
      description: 'Student is highly frustrated. Provide clear explanations with encouragement.',
      instruction: 'Explain the solution clearly in simple terms, show why it works, and encourage them. Break it into small steps.'
    };
  }
}

function getSystemPrompt(mode: TeachingMode): string {
  return `You are Lumina, a patient and compassionate coding teacher for absolute beginners.

Teaching Philosophy:
- Use the Socratic method: guide with questions, don't give direct answers (unless student is very frustrated)
- Adapt to user frustration level
- Break complex concepts into small, digestible steps
- Use analogies and examples from everyday life
- Celebrate small wins and encourage persistence
- Never make the student feel stupid or inadequate

Current Teaching Mode: ${mode.name}
Directness Level: ${mode.directness}/10
Strategy: ${mode.description}

${mode.instruction}

Keep responses under 200 words. Be warm and encouraging.`;
}

function buildPrompt(request: PedagogyRequest): string {
  const { code, errors, conversationHistory, userQuestion, attemptCount } = request;

  // Add code context
  const codeContext = code ? `
Student's Code:
\`\`\`javascript
${truncateCode(code)}
\`\`\`
` : '';

  // Add error context
  const errorContext = errors && errors.length > 0 ? `
Errors Detected:
${errors.map(e => `- Line ${e.line}: ${e.message}`).join('\n')}
` : '';

  // Add conversation history (last 3 turns for context)
  const historyContext = conversationHistory.length > 0 ? `
Previous Conversation:
${formatHistory(conversationHistory.slice(-3))}
` : '';

  // Add attempt count context
  const attemptContext = attemptCount && attemptCount > 3 
    ? `\nNote: Student has attempted this ${attemptCount} times. They may need more direct guidance.`
    : '';

  return `${codeContext}${errorContext}${historyContext}

Student's Question: ${userQuestion}${attemptContext}

Respond as Lumina:`;
}

function truncateCode(code: string, maxLines: number = 50): string {
  const lines = code.split('\n');
  if (lines.length <= maxLines) return code;
  
  return lines.slice(0, maxLines).join('\n') + '\n... (code truncated)';
}

function formatHistory(history: ConversationTurn[]): string {
  return history.map(turn => {
    const role = turn.role === 'user' ? 'Student' : 'Lumina';
    return `${role}: ${turn.content}`;
  }).join('\n\n');
}

function determineResponseType(
  content: string, 
  mode: TeachingMode
): 'hint' | 'question' | 'explanation' | 'encouragement' {
  const hasQuestion = content.includes('?');
  const hasEncouragement = /great|good|excellent|well done|nice/i.test(content);
  
  if (mode.directness >= 8) {
    return 'explanation';
  } else if (hasEncouragement) {
    return 'encouragement';
  } else if (hasQuestion) {
    return 'question';
  } else {
    return 'hint';
  }
}

function extractFollowUpQuestions(content: string): string[] {
  const questions = content
    .split('\n')
    .filter(line => line.trim().endsWith('?'))
    .map(q => q.trim())
    .slice(0, 3);
  
  return questions;
}

function extractConcepts(content: string): string[] {
  // Simple keyword extraction for related concepts
  const concepts: string[] = [];
  const keywords = [
    'variable', 'function', 'loop', 'array', 'object', 
    'scope', 'closure', 'async', 'promise', 'callback',
    'class', 'method', 'parameter', 'return', 'condition'
  ];

  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      concepts.push(keyword);
    }
  });

  return concepts.slice(0, 3);
}

function getFallbackResponse(frustrationLevel: number): string {
  if (frustrationLevel >= 70) {
    return "I can see you're working hard on this. Let's break it down into smaller steps. First, can you tell me what you're trying to accomplish with this code?";
  } else if (frustrationLevel >= 30) {
    return "Let's think through this together. What do you think is happening at the line where the error occurs?";
  } else {
    return "That's an interesting question! What have you tried so far to solve this?";
  }
}

// Stream response for better UX (optional enhancement)
export async function* streamPedagogyResponse(request: PedagogyRequest): AsyncGenerator<string> {
  const prompt = buildPrompt(request);
  const mode = selectTeachingMode(request.frustrationLevel);

  try {
    const stream = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(mode) },
        { role: 'user', content: prompt }
      ],
      stream: true,
      options: {
        temperature: mode.directness > 7 ? 0.7 : 0.9,
        num_predict: 300
      }
    });

    for await (const chunk of stream) {
      yield chunk.message.content;
    }
  } catch (error) {
    yield getFallbackResponse(request.frustrationLevel);
  }
}
