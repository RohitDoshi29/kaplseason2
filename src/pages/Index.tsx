import { useEffect, useRef } from 'react';
import { useCricketStore } from '@/hooks/useCricketStore';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { ScoreCard } from '@/components/cricket/ScoreCard';
import { BallTicker } from '@/components/cricket/BallTicker';
import { OverTable } from '@/components/cricket/OverTable';
import { LiveMatchInfo } from '@/components/cricket/LiveMatchInfo';
import { MatchHistory } from '@/components/cricket/MatchHistory';
import { PlayCircle, History } from 'lucide-react';
import { MATCH_TYPE_LABELS } from '@/lib/cricketTypes';
import { CricketAnimation, useCricketAnimation } from '@/components/cricket/CricketAnimations';

const Index = () => {
  const { matchState, matchHistory, getTeam, isLoaded } = useCricketStore();
  const { animation, triggerFour, triggerSix, triggerWicket, triggerWinner, clearAnimation } = useCricketAnimation();
  const lastProcessedBallRef = useRef<string | null>(null);
  const match = matchState.currentMatch;

  const team1 = match ? getTeam(match.team1Id) : null;
  const team2 = match ? getTeam(match.team2Id) : null;
  const currentInnings = match?.currentInnings === 1 ? match.innings1 : match?.innings2;
  const battingTeam = match?.currentInnings === 1 ? team1 : team2;
  const bowlingTeam = match?.currentInnings === 1 ? team2 : team1;
  const allBalls = currentInnings?.overs.flatMap(o => o.balls) || [];

  // Trigger animations for viewers based on last ball
  useEffect(() => {
    if (!allBalls.length) return;
    
    const lastBall = allBalls[allBalls.length - 1];
    if (!lastBall || lastBall.id === lastProcessedBallRef.current) return;
    
    lastProcessedBallRef.current = lastBall.id;
    
    if (lastBall.isWicket) {
      triggerWicket();
    } else if (lastBall.runs === 6 && !lastBall.isExtra) {
      triggerSix();
    } else if (lastBall.runs === 4 && !lastBall.isExtra) {
      triggerFour();
    }
  }, [allBalls, triggerFour, triggerSix, triggerWicket]);

  // Trigger winner animation when match is completed
  useEffect(() => {
    if (match?.status === 'completed' && match.winner) {
      const winnerTeam = getTeam(match.winner);
      if (winnerTeam) {
        triggerWinner(winnerTeam.name);
      }
    }
  }, [match?.status, match?.winner, getTeam, triggerWinner]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <CricketAnimation
        type={animation.type}
        teamName={animation.teamName}
        onComplete={clearAnimation}
      />
      <div className="min-h-screen bg-background pb-20 md:pb-4">
        <Navigation />
        <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {match && team1 && team2 ? (
          <>
            {/* Match Status */}
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                <span className="w-2 h-2 bg-destructive rounded-full" />
                LIVE
              </span>
              <div className="text-lg font-semibold text-foreground">
                {MATCH_TYPE_LABELS[match.matchType]} {match.matchType === 'group' && `- Group ${match.group}`}
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {match.innings1 && (
                <ScoreCard
                  battingTeam={team1}
                  bowlingTeam={team2}
                  innings={match.innings1}
                  isBatting={match.currentInnings === 1}
                />
              )}
              {match.innings2 && (
                <ScoreCard
                  battingTeam={team2}
                  bowlingTeam={team1}
                  innings={match.innings2}
                  isBatting={match.currentInnings === 2}
                />
              )}
              {!match.innings2 && match.currentInnings === 1 && (
                <div className="rounded-2xl p-6 border-2 border-dashed border-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Innings 2 - Yet to bat</span>
                </div>
              )}
            </div>

            {/* Live Match Info - Batsmen, Bowler, Run Rates */}
            {currentInnings && battingTeam && bowlingTeam && (
              <LiveMatchInfo
                match={match}
                battingTeam={battingTeam}
                bowlingTeam={bowlingTeam}
                currentInnings={currentInnings}
              />
            )}

            {/* Ball Ticker */}
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <BallTicker balls={allBalls} />
            </div>

            {/* Over Table */}
            {currentInnings && <OverTable overs={currentInnings.overs} />}

            {/* Match History */}
            <MatchHistory matchHistory={matchHistory} getTeam={getTeam} limit={5} />
          </>
        ) : (
          <div className="space-y-8">
            <div className="text-center py-16 space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">No Live Match</h2>
                <p className="text-muted-foreground">
                  No match is currently in progress
                </p>
              </div>
            </div>
            
            {/* Match History when no live match */}
            <MatchHistory matchHistory={matchHistory} getTeam={getTeam} limit={10} />
          </div>
        )}
      </main>
      </div>
    </>
  );
};

export default Index;
