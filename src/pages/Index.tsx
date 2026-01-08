import { useEffect, useRef } from 'react';
import { useCricketStore } from '@/hooks/useCricketStore';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { ScoreCard } from '@/components/cricket/ScoreCard';
import { BallTicker } from '@/components/cricket/BallTicker';
import { OverTable } from '@/components/cricket/OverTable';
import { LiveMatchInfo, LastMatchResult } from '@/components/cricket/LiveMatchInfo';
import { MatchHistory } from '@/components/cricket/MatchHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Trophy } from 'lucide-react';
import { MATCH_TYPE_LABELS, Match } from '@/lib/cricketTypes';
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

  // Get last completed match
  const completedMatches = matchHistory.filter(m => m.status === 'completed');
  const lastCompletedMatch = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;

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
              {match.status === 'super_over' ? (
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                  <span className="text-lg">⚡</span>
                  SUPER OVER
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                  <span className="w-2 h-2 bg-destructive rounded-full" />
                  LIVE
                </span>
              )}
              <div className="text-lg font-semibold text-foreground">
                {MATCH_TYPE_LABELS[match.matchType]} {match.matchType === 'group' && `- Group ${match.group}`}
              </div>
            </div>

            {/* Super Over Score Display */}
            {match.superOver && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <Badge className="bg-primary/20 text-primary">⚡ Super Over</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-bold">{team1.name}</div>
                      <div className="text-2xl font-bold text-primary">
                        {match.superOver.innings1?.runs || 0}/{match.superOver.innings1?.wickets || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({match.superOver.innings1?.currentOver || 0}.{match.superOver.innings1?.currentBall || 0} ov)
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{team2.name}</div>
                      <div className="text-2xl font-bold text-primary">
                        {match.superOver.innings2?.runs || 0}/{match.superOver.innings2?.wickets || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({match.superOver.innings2?.currentOver || 0}.{match.superOver.innings2?.currentBall || 0} ov)
                      </div>
                    </div>
                  </div>
                  {match.superOver.currentInnings === 2 && match.superOver.innings1 && (
                    <div className="text-center mt-3 text-sm">
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-bold">{match.superOver.innings1.runs + 1}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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

            {/* Live Match Info - Batsmen, Bowler, Run Rates, Full Scorecard */}
            {currentInnings && battingTeam && bowlingTeam && (
              <LiveMatchInfo
                match={match}
                battingTeam={battingTeam}
                bowlingTeam={bowlingTeam}
                currentInnings={currentInnings}
                team1={team1}
                team2={team2}
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
            {/* Show last match result if available */}
            {lastCompletedMatch && (
              <LastMatchResult
                match={lastCompletedMatch}
                team1={getTeam(lastCompletedMatch.team1Id)!}
                team2={getTeam(lastCompletedMatch.team2Id)!}
                winnerTeam={lastCompletedMatch.winner ? getTeam(lastCompletedMatch.winner) || null : null}
              />
            )}
            
            <div className="text-center py-12 space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">No Live Match</h2>
                <p className="text-muted-foreground">
                  Waiting for the next match to begin...
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
