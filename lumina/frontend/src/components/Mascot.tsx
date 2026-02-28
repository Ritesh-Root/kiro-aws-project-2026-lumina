import { useEffect, useState } from 'react';
import './Mascot.css';

interface Props {
  frustrationLevel: number;
  isThinking?: boolean;
  hasAhaMoment?: boolean;
  comboStreak?: number;
}

export default function Mascot({ frustrationLevel, isThinking = false, hasAhaMoment = false, comboStreak = 0 }: Props) {
  const [currentEmotion, setCurrentEmotion] = useState<'calm' | 'stuck' | 'aha' | 'thinking'>('calm');
  const [showAhaEffect, setShowAhaEffect] = useState(false);

  useEffect(() => {
    if (hasAhaMoment) {
      setCurrentEmotion('aha');
      setShowAhaEffect(true);
      const timer = setTimeout(() => {
        setShowAhaEffect(false);
        setCurrentEmotion('calm');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isThinking) {
      setCurrentEmotion('thinking');
    } else if (frustrationLevel >= 0.6) {
      setCurrentEmotion('stuck');
    } else {
      setCurrentEmotion('calm');
    }
  }, [frustrationLevel, isThinking, hasAhaMoment]);

  const getMascotFace = () => {
    switch (currentEmotion) {
      case 'stuck':
        return (
          <>
            <div className="mascot-eyes dizzy">
              <div className="eye dizzy-left">@</div>
              <div className="eye dizzy-right">@</div>
            </div>
            <div className="mascot-mouth worried">〜</div>
            <div className="sweat-drop"></div>
            <div className="sweat-drop delay-1"></div>
          </>
        );
      case 'aha':
        return (
          <>
            <div className="mascot-eyes starry">
              <div className="eye star-left">🤩</div>
              <div className="eye star-right">✨</div>
            </div>
            <div className="mascot-mouth happy">◡</div>
            {showAhaEffect && <div className="glow-aura"></div>}
          </>
        );
      case 'thinking':
        return (
          <>
            <div className="mascot-eyes focused">
              <div className="eye">⊙</div>
              <div className="eye">⊙</div>
            </div>
            <div className="mascot-mouth neutral">—</div>
            <div className="visor-glasses"></div>
            <div className="holographic-keyboard"></div>
          </>
        );
      default:
        return (
          <>
            <div className="mascot-eyes calm">
              <div className="eye">◕</div>
              <div className="eye">◕</div>
            </div>
            <div className="mascot-mouth calm">◡</div>
          </>
        );
    }
  };

  return (
    <div className="mascot-container">
      <div className={`mascot-body emotion-${currentEmotion}`}>
        <div className="mascot-head">
          <div className="antenna">
            <div className="antenna-ball"></div>
          </div>
          {getMascotFace()}
        </div>
        <div className="mascot-torso">
          <div className="chest-light"></div>
        </div>
      </div>
      {comboStreak > 0 && (
        <div className="combo-streak">
          <span className="fire-icon">🔥</span>
          <span className="streak-count">{comboStreak}</span>
        </div>
      )}
    </div>
  );
}
