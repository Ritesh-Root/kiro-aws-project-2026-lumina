import { useEffect, useState } from 'react';
import axios from 'axios';
import './VisualizationPanel.css';

interface Props {
  code: string;
}

export default function VisualizationPanel({ code }: Props) {
  const [mermaidDiagram, setMermaidDiagram] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code.trim()) return;

    const visualize = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:3001/api/visualize', { code });
        setMermaidDiagram(res.data.mermaidDiagram || '');
      } catch (err) {
        console.error('Visualization error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(visualize, 1000);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="visualization-panel">
      <div className="panel-header">
        <span>📊 Visual Runtime</span>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="loading">Analyzing code structure...</div>
        ) : mermaidDiagram ? (
          <pre className="mermaid-diagram">{mermaidDiagram}</pre>
        ) : (
          <div className="empty-state">Write code to see visualization</div>
        )}
      </div>
    </div>
  );
}
