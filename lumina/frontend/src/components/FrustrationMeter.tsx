import './FrustrationMeter.css';

interface Props {
  level: number; // 0 to 1
}

export default function FrustrationMeter({ level }: Props) {
  const getColor = () => {
    if (level < 0.3) return '#4caf50';
    if (level < 0.6) return '#ff9800';
    return '#f44336';
  };

  const getEmoji = () => {
    if (level < 0.3) return '😊';
    if (level < 0.6) return '😐';
    return '😤';
  };

  return (
    <div className="frustration-meter">
      <span className="meter-emoji">{getEmoji()}</span>
      <div className="meter-bar">
        <div 
          className="meter-fill" 
          style={{ 
            width: `${level * 100}%`,
            background: getColor()
          }}
        />
      </div>
      <span className="meter-label">
        {level < 0.3 ? 'Calm' : level < 0.6 ? 'Focused' : 'Frustrated'}
      </span>
    </div>
  );
}
