import { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import VisualizationPanel from './components/VisualizationPanel';
import PedagogyPanel from './components/PedagogyPanel';
import FrustrationMeter from './components/FrustrationMeter';
import VoiceInterface from './components/VoiceInterface';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [frustrationLevel, setFrustrationLevel] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌟 Lumina</h1>
        <p>Your Compassionate Coding Companion</p>
        <FrustrationMeter level={frustrationLevel} />
      </header>

      <div className="app-content">
        <div className="left-panel">
          <CodeEditor code={code} onChange={setCode} />
          <VoiceInterface onFrustrationChange={setFrustrationLevel} />
        </div>

        <div className="right-panel">
          <VisualizationPanel code={code} />
          <PedagogyPanel code={code} frustrationLevel={frustrationLevel} />
        </div>
      </div>
    </div>
  );
}

export default App;
