import { useState } from 'react';
import './CodeEditor.css';

interface Props {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ code, onChange }: Props) {
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    onChange(newCode);
    
    const lines = newCode.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span>Code Editor</span>
      </div>
      <div className="editor-container">
        <div className="line-numbers">
          {lineNumbers.map(num => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <textarea
          className="code-input"
          value={code}
          onChange={handleChange}
          placeholder="// Start coding here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
