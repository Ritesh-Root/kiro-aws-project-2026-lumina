import { useEffect, useState } from 'react';
import './NeonConfetti.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  velocityX: number;
  velocityY: number;
}

interface Props {
  trigger: boolean;
  onComplete?: () => void;
}

export default function NeonConfetti({ trigger, onComplete }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      const colors = ['#ff6b9d', '#c44569', '#f8b500', '#00d2ff', '#3a7bd5', '#9b59b6', '#2ecc71'];
      const newParticles: Particle[] = [];

      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: 50,
          y: 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 10 + 5,
          velocityX: (Math.random() - 0.5) * 100,
          velocityY: (Math.random() - 0.5) * 100 - 50,
        });
      }

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="neon-confetti-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            '--start-x': `${particle.x}%`,
            '--start-y': `${particle.y}%`,
            '--end-x': `${particle.x + particle.velocityX}%`,
            '--end-y': `${particle.y + particle.velocityY}%`,
            '--rotation': `${particle.rotation}deg`,
            '--color': particle.color,
            '--size': `${particle.size}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
