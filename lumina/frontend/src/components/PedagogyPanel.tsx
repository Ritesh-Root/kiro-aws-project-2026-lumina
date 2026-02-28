import { useState } from 'react';
import axios from 'axios';
import './PedagogyPanel.css';

interface Props {
  code: string;
  frustrationLevel: number;
}

interface Message {
  id: string;
  type: 'user' | 'lumina';
  content: string;
  responseType?: string;
  followUpQuestions?: string[];
  timestamp: Date;
}

export default function PedagogyPanel({ code, frustrationLevel }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/pedagogy', {
        code,
        userInput: userMessage.content,
        sentiment: { frustrationLevel: frustrationLevel > 0.6 ? 'high' : 'low' }
      });

      const luminaMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'lumina',
        content: res.data.content,
        responseType: res.data.type,
        followUpQuestions: res.data.followUpQuestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, luminaMessage]);
    } catch (err) {
      console.error('Pedagogy error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'lumina',
        content: 'Sorry, I encountered an error. Please try again!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pedagogy-panel">
      <div className="panel-header">
        <span>🧠 Lumina's Guidance</span>
        <div className="mascot-container">
          <div className={`mascot ${loading ? 'thinking' : frustrationLevel > 0.6 ? 'empathetic' : 'happy'}`}>
            <div className="mascot-face">
              <div className="mascot-eyes">
                <span className="eye left"></span>
                <span className="eye right"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>👋 Hi! I'm Lumina, your coding companion.</p>
            <p>Ask me anything about your code!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.type === 'lumina' && msg.responseType && (
                  <div className={`response-type ${msg.responseType}`}>
                    {msg.responseType}
                  </div>
                )}
                <p>{msg.content}</p>
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="follow-up">
                    <strong>Think about:</strong>
                    <ul>
                      {msg.followUpQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message lumina loading-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

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
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
}
