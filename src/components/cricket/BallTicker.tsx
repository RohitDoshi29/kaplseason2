import { Ball } from '@/lib/cricketTypes';
import { cn } from '@/lib/utils';

interface BallTickerProps {
  balls: Ball[];
  className?: string;
}

export function BallTicker({ balls, className }: BallTickerProps) {
  const lastBalls = balls.slice(-6);

  const getBallDisplay = (ball: Ball) => {
    if (ball.isWicket) return 'W';
    if (ball.isWide) return 'Wd';
    if (ball.isNoBall) return 'Nb';
    return ball.runs.toString();
  };

  const getBallStyle = (ball: Ball) => {
    if (ball.isWicket) return 'bg-destructive text-destructive-foreground';
    if (ball.runs === 4) return 'bg-cricket-four text-white';
    if (ball.runs === 6) return 'bg-cricket-six text-white';
    if (ball.isWide || ball.isNoBall) return 'bg-cricket-extra text-black';
    if (ball.runs < 0) return 'bg-destructive/80 text-destructive-foreground';
    return 'bg-muted text-foreground';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground font-medium">LAST BALLS:</span>
      <div className="flex gap-1">
        {lastBalls.map((ball, index) => (
          <div
            key={ball.id}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm animate-scale-in',
              getBallStyle(ball)
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {getBallDisplay(ball)}
          </div>
        ))}
        {lastBalls.length === 0 && (
          <span className="text-muted-foreground text-sm">No balls yet</span>
        )}
      </div>
    </div>
  );
}
