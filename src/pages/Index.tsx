import { useCricketStore } from '@/hooks/useCricketStore';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { ScoreCard } from '@/components/cricket/ScoreCard';
import { BallTicker } from '@/components/cricket/BallTicker';
import { OverTable } from '@/components/cricket/OverTable';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

const Index = () => {
  const { matchState, getTeam, isLoaded } = useCricketStore();
  const match = matchState.currentMatch;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const team1 = match ? getTeam(match.team1Id) : null;
  const team2 = match ? getTeam(match.team2Id) : null;
  const currentInnings = match?.currentInnings === 1 ? match.innings1 : match?.innings2;
  const allBalls = currentInnings?.overs.flatMap(o => o.balls) || [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <Navigation />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {match && team1 && team2 ? (
          <>
            {/* Match Status */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                <span className="w-2 h-2 bg-destructive rounded-full" />
                LIVE - Group {match.group}
              </span>
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

            {/* Ball Ticker */}
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <BallTicker balls={allBalls} />
            </div>

            {/* Over Table */}
            {currentInnings && <OverTable overs={currentInnings.overs} />}
          </>
        ) : (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">No Live Match</h2>
              <p className="text-muted-foreground mb-6">
                Start a new match to see live scores here
              </p>
              <Link to="/match-setup">
                <Button size="lg" className="gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Start New Match
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
