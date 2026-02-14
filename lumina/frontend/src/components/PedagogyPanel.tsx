import { useState, useEffect } from 'react';
import axios from 'axios';
import './PedagogyPanel.css';

interface Props {
  code: string;
  frustrationLevel: number;
}

export default function PedagogyPanel({ code, frustrationLevel }: Props) {
  const [response, setResponse] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/pedagogy', {
        code,
        userInput,
        sentiment: { frustrationLevel: frustrationLevel > 0.6 ? 'high' : 'low' }
      });
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
        {response && (
          <div className="response">
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
