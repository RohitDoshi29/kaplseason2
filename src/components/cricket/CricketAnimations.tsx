import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'four' | 'six' | 'wicket' | 'winner' | null;

interface CricketAnimationProps {
  type: AnimationType;
  teamName?: string;
  onComplete?: () => void;
}

export function CricketAnimation({ type, teamName, onComplete }: CricketAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setVisible(true);
      // Animation durations: winner 4s, others 1.5s
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, type === 'winner' ? 4000 : 1500);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  if (!type || !visible) return null;

  const config = {
    four: {
      text: 'FOUR!',
      emoji: '4️⃣',
      bgClass: 'bg-cricket-four/95',
      textClass: 'text-white',
      particles: ['🏏', '💥', '🔥', '⚡'],
    },
    six: {
      text: 'SIX!',
      emoji: '6️⃣',
      bgClass: 'bg-cricket-six/95',
      textClass: 'text-white',
      particles: ['🏏', '💥', '🚀', '⭐', '🔥', '✨'],
    },
    wicket: {
      text: 'OUT!',
      emoji: '🎯',
      bgClass: 'bg-destructive/95',
      textClass: 'text-destructive-foreground',
      particles: ['💀', '🪵', '💨', '😱'],
    },
    winner: {
      text: teamName || 'WINNER!',
      emoji: '🏆',
      bgClass: 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600',
      textClass: 'text-white',
      particles: ['🏆', '🎉', '🎊', '🥳', '⭐', '✨', '🎯', '🏏'],
    },
  };

  const { text, emoji, bgClass, textClass, particles } = config[type];

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center animate-overlay-in',
      bgClass
    )}>
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <span
            key={i}
            className="absolute text-4xl md:text-6xl animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          >
            {particle}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="text-center relative z-10">
        <div className="text-6xl md:text-8xl mb-4 animate-bounce-in">
          {emoji}
        </div>
        <h1 className={cn(
          'text-5xl md:text-8xl font-display font-bold animate-text-pop',
          textClass
        )}>
          {text}
        </h1>
        {type === 'winner' && (
          <p className={cn('text-2xl md:text-4xl mt-4 animate-fade-in', textClass)}>
            🎉 MATCH WINNER 🎉
          </p>
        )}
      </div>

      {/* Confetti for winner */}
      {type === 'winner' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#EC4899'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Hook to manage cricket animations
export function useCricketAnimation() {
  const [animation, setAnimation] = useState<{ type: AnimationType; teamName?: string }>({ type: null });

  const triggerFour = () => setAnimation({ type: 'four' });
  const triggerSix = () => setAnimation({ type: 'six' });
  const triggerWicket = () => setAnimation({ type: 'wicket' });
  const triggerWinner = (teamName: string) => setAnimation({ type: 'winner', teamName });
  const clearAnimation = () => setAnimation({ type: null });

  return {
    animation,
    triggerFour,
    triggerSix,
    triggerWicket,
    triggerWinner,
    clearAnimation,
  };
}
