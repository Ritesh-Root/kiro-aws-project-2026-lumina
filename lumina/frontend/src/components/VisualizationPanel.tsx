import { useEffect, useState } from 'react';
import axios from 'axios';
import './VisualizationPanel.css';

interface Props {
  code: string;
  onNodeClick?: (lineNumbers: number[]) => void;
}

export default function VisualizationPanel({ code, onNodeClick }: Props) {
  const [mermaidDiagram, setMermaidDiagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeStructure, setCodeStructure] = useState<any>(null);

  useEffect(() => {
    if (!code.trim()) return;

    const visualize = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:3001/api/visualize', { code });
        setMermaidDiagram(res.data.mermaidDiagram || '');
        setCodeStructure(res.data.structure || null);
      } catch (err) {
        console.error('Visualization error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(visualize, 1000);
    return () => clearTimeout(timer);
  }, [code]);

  const handleDiagramClick = (e: React.MouseEvent<HTMLPreElement>) => {
    if (!codeStructure || !onNodeClick) return;

    const target = e.target as HTMLElement;
    const clickedText = target.textContent || '';

    // Try to find the function/variable in the code structure
    const functions = codeStructure.functions || [];
    const variables = codeStructure.variables || [];

    // Search for function
    const matchedFunction = functions.find((fn: any) =>
      clickedText.includes(fn.name)
    );

    if (matchedFunction?.location?.start?.line) {
      const lineNum = matchedFunction.location.start.line;
      onNodeClick([lineNum]);
      return;
    }

    // Search for variable
    const matchedVariable = variables.find((v: any) =>
      clickedText.includes(v.name)
    );

    if (matchedVariable?.location?.start?.line) {
      const lineNum = matchedVariable.location.start.line;
      onNodeClick([lineNum]);
    }
  };

  return (
    <div className="visualization-panel">
      <div className="panel-header">
        <span>📊 Visual Runtime</span>
        <span className="panel-hint">💡 Click nodes to highlight code</span>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="loading">Analyzing code structure...</div>
        ) : mermaidDiagram ? (
          <pre
            className="mermaid-diagram"
            onClick={handleDiagramClick}
          >
            {mermaidDiagram}
          </pre>
        ) : (
          <div className="empty-state">Write code to see visualization</div>
        )}
      </div>
    </div>
  );
}
