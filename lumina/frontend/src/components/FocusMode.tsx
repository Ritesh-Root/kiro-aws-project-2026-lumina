import './FocusMode.css';

interface Props {
  isActive: boolean;
  onToggle: () => void;
}

export default function FocusMode({ isActive, onToggle }: Props) {
  return (
    <div className="focus-mode-toggle">
      <button
        className={`focus-button ${isActive ? 'active' : ''}`}
        onClick={onToggle}
        title={isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
      >
        <span className="focus-icon">{isActive ? '👁️' : '🌙'}</span>
        <span className="focus-label">Focus</span>
      </button>
    </div>
  );
}
