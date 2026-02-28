import { useState, useEffect, useRef } from 'react';
import './CodeEditor.css';

interface Props {
  code: string;
  onChange: (code: string) => void;
  highlightedLines?: number[];
}

export default function CodeEditor({ code, onChange, highlightedLines = [] }: Props) {
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);
  const [showShockwave, setShowShockwave] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    onChange(newCode);

    const lines = newCode.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Trigger shockwave on Ctrl/Cmd+S (save) or Ctrl/Cmd+Enter (run)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'Enter')) {
      e.preventDefault();
      triggerShockwave();
    }
  };

  const triggerShockwave = () => {
    setShowShockwave(true);
    setTimeout(() => setShowShockwave(false), 1000);
  };

  // Apply highlighted line effect
  useEffect(() => {
    if (highlightedLines.length > 0 && textareaRef.current) {
      const lines = code.split('\n');
      const highlightedLineIndex = highlightedLines[0] - 1;

      if (highlightedLineIndex >= 0 && highlightedLineIndex < lines.length) {
        // Calculate position to scroll to
        const lineHeight = 21; // Approximate line height
        const scrollPosition = highlightedLineIndex * lineHeight;
        textareaRef.current.scrollTop = scrollPosition - 100;
      }
    }
  }, [highlightedLines, code]);

  return (
    <div className={`code-editor ${showShockwave ? 'shockwave-active' : ''}`} ref={editorRef}>
      <div className="editor-header">
        <span>Code Editor</span>
        <span className="editor-hint">💡 Press Ctrl+S or Ctrl+Enter to save/run</span>
      </div>
      <div className="editor-container">
        <div className="line-numbers">
          {lineNumbers.map(num => (
            <div
              key={num}
              className={highlightedLines.includes(num) ? 'highlighted' : ''}
            >
              {num}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="code-input"
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder="// Start coding here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
