import { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import VisualizationPanel from './components/VisualizationPanel';
import PedagogyPanel from './components/PedagogyPanel';
import FrustrationMeter from './components/FrustrationMeter';
import VoiceInterface from './components/VoiceInterface';
import Mascot from './components/Mascot';
import FocusMode from './components/FocusMode';
import NeonConfetti from './components/NeonConfetti';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [frustrationLevel, setFrustrationLevel] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [hasAhaMoment, setHasAhaMoment] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [prevFrustrationLevel, setPrevFrustrationLevel] = useState(0);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);

  // Detect "Aha!" moment when frustration drops significantly
  useEffect(() => {
    if (prevFrustrationLevel >= 0.6 && frustrationLevel < 0.4) {
      setHasAhaMoment(true);
      setShowConfetti(true);
      setComboStreak(prev => prev + 1);
      setTimeout(() => setHasAhaMoment(false), 3000);
    }
    setPrevFrustrationLevel(frustrationLevel);
  }, [frustrationLevel, prevFrustrationLevel]);

  // Reset combo streak if frustration gets high
  useEffect(() => {
    if (frustrationLevel >= 0.7) {
      setComboStreak(0);
    }
  }, [frustrationLevel]);

  const handleFrustrationChange = (level: number) => {
    setFrustrationLevel(level);
  };

  // Determine frustration level for background gradient
  const getFrustrationClass = () => {
    if (frustrationLevel < 0.3) return 'low';
    if (frustrationLevel < 0.7) return 'medium';
    return 'high';
  };

  return (
    <div
      className={`app ${focusModeActive ? 'focus-mode-active' : ''}`}
      data-frustration={getFrustrationClass()}
    >
      <header className="app-header glassmorphic">
        <div className="header-content">
          <div className="title-section">
            <h1>🌟 Lumina</h1>
            <p>Your Compassionate Coding Companion</p>
          </div>
          <Mascot
            frustrationLevel={frustrationLevel}
            isThinking={isThinking}
            hasAhaMoment={hasAhaMoment}
            comboStreak={comboStreak}
          />
          <FrustrationMeter level={frustrationLevel} />
        </div>
      </header>

      <FocusMode
        isActive={focusModeActive}
        onToggle={() => setFocusModeActive(!focusModeActive)}
      />

      <div className="app-content">
        <div className="left-panel">
          <CodeEditor
            code={code}
            onChange={setCode}
            highlightedLines={highlightedLines}
          />
          <VoiceInterface onFrustrationChange={handleFrustrationChange} />
        </div>

        <div className="right-panel">
          <VisualizationPanel
            code={code}
            onNodeClick={(lineNumbers) => setHighlightedLines(lineNumbers)}
          />
          <PedagogyPanel
            code={code}
            frustrationLevel={frustrationLevel}
            onThinkingChange={setIsThinking}
          />
        </div>
      </div>

      <NeonConfetti
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}

export default App;
