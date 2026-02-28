import { useState, useEffect } from 'react';
import './VoiceInterface.css';

interface Props {
  onFrustrationChange: (level: number) => void;
}

export default function VoiceInterface({ onFrustrationChange }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript] = useState('');

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    setIsListening(!isListening);
  };

  useEffect(() => {
    if (transcript.toLowerCase().includes('frustrated') || 
        transcript.toLowerCase().includes('confused') ||
        transcript.toLowerCase().includes('help')) {
      onFrustrationChange(0.8);
    } else if (transcript.length > 0) {
      onFrustrationChange(0.3);
    }
  }, [transcript, onFrustrationChange]);

  return (
    <div className="voice-interface">
      <button 
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
      >
        {isListening ? '🎤 Listening...' : '🎤 Talk to Lumina'}
      </button>
      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> {transcript}
        </div>
      )}
    </div>
  );
}
