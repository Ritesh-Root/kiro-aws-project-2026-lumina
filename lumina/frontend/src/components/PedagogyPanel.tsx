import { useState, useEffect } from 'react';
import axios from 'axios';
import './PedagogyPanel.css';

interface Props {
  code: string;
  frustrationLevel: number;
  onThinkingChange?: (isThinking: boolean) => void;
}

export default function PedagogyPanel({ code, frustrationLevel, onThinkingChange }: Props) {
  const [response, setResponse] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCodeFix, setIsCodeFix] = useState(false);

  useEffect(() => {
    onThinkingChange?.(loading);
  }, [loading, onThinkingChange]);

  const handleAsk = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/pedagogy', {
        code,
        userInput,
        sentiment: { frustrationLevel: frustrationLevel > 0.6 ? 'high' : 'low' }
      });

      // Detect if response contains code fix
      const containsCode = res.data.content?.includes('```') || res.data.content?.includes('function') || res.data.content?.includes('const');
      setIsCodeFix(containsCode);

      setResponse(res.data);
      setUserInput('');
    } catch (err) {
      console.error('Pedagogy error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pedagogy-panel">
      <div className="panel-header">
        <span>🧠 Lumina's Guidance</span>
      </div>
      <div className="panel-content">
        {loading && (
          <div className="thinking-indicator">
            <span>Lumina is thinking</span>
            <div className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {response && (
          <div className={`response ${isCodeFix ? 'code-fix' : ''}`}>
            <div className={`response-type ${response.type}`}>
              {response.type}
            </div>
            <p>{response.content}</p>
            {response.followUpQuestions && (
              <div className="follow-up">
                <strong>Think about:</strong>
                <ul>
                  {response.followUpQuestions.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask Lumina for guidance..."
            disabled={loading}
          />
          <button onClick={handleAsk} disabled={loading || !userInput.trim()}>
            {loading ? '...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}
