import { useCricketStore } from '@/hooks/useCricketStore';
import { AdminPasswordGate } from '@/components/cricket/AdminPasswordGate';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Undo2, RefreshCw, Flag, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPanel() {
  const { matchState, getTeam, addBall, undoLastBall, switchBattingTeam, endMatch } = useCricketStore();
  const match = matchState.currentMatch;

  const team1 = match ? getTeam(match.team1Id) : null;
  const team2 = match ? getTeam(match.team2Id) : null;
  const currentInnings = match?.currentInnings === 1 ? match.innings1 : match?.innings2;
  const battingTeam = match?.currentInnings === 1 ? team1 : team2;

  const handleAddBall = (runs: number, isWicket = false, isWide = false, isNoBall = false) => {
    addBall(runs, isWicket, isWide, isNoBall);
    if (isWicket) {
      toast.error('WICKET!', { duration: 2000 });
    } else if (runs === 4) {
      toast.success('FOUR!', { duration: 1500 });
    } else if (runs === 6) {
      toast.success('SIX!', { duration: 1500 });
    }
  };

  const handleUndo = () => {
    undoLastBall();
    toast.info('Last ball undone');
  };

  const handleSwitchInnings = () => {
    switchBattingTeam();
    toast.success('Innings switched!');
  };

  const handleEndMatch = () => {
    endMatch();
    toast.success('Match ended!');
  };

  const canUndo = !!matchState.lastAction;

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-background pb-20 md:pb-4">
        <Navigation />
        <Header />

        <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {match && team1 && team2 && currentInnings && battingTeam ? (
            <>
              {/* Current Score */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <TeamBadge team={battingTeam} size="md" />
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        {currentInnings.runs}/{currentInnings.wickets}
                      </div>
                      <div className="text-muted-foreground">
                        ({currentInnings.currentOver}.{currentInnings.currentBall} ov)
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Scoring Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Scoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Runs */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Runs</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((runs) => (
                        <Button
                          key={runs}
                          variant="outline"
                          className="h-14 text-xl font-bold"
                          onClick={() => handleAddBall(runs)}
                        >
                          {runs}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Boundaries */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Boundaries</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="h-14 text-xl font-bold bg-cricket-four hover:bg-cricket-four/90"
                        onClick={() => handleAddBall(4)}
                      >
                        4
                      </Button>
                      <Button
                        className="h-14 text-xl font-bold bg-cricket-six hover:bg-cricket-six/90"
                        onClick={() => handleAddBall(6)}
                      >
                        6
                      </Button>
                    </div>
                  </div>

                  {/* Penalties */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Penalties</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="destructive"
                        className="h-12 font-bold"
                        onClick={() => handleAddBall(-1)}
                      >
                        -1
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-12 font-bold"
                        onClick={() => handleAddBall(-2)}
                      >
                        -2
                      </Button>
                    </div>
                  </div>

                  {/* Extras */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Extras</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="h-12 font-bold bg-cricket-extra text-black hover:bg-cricket-extra/90"
                        onClick={() => handleAddBall(1, false, true, false)}
                      >
                        Wide
                      </Button>
                      <Button
                        className="h-12 font-bold bg-cricket-extra text-black hover:bg-cricket-extra/90"
                        onClick={() => handleAddBall(1, false, false, true)}
                      >
                        No Ball
                      </Button>
                    </div>
                  </div>

                  {/* Wicket */}
                  <Button
                    variant="destructive"
                    className="w-full h-16 text-2xl font-bold"
                    onClick={() => handleAddBall(0, true)}
                  >
                    WICKET
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Match Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 gap-2"
                    onClick={handleUndo}
                    disabled={!canUndo}
                  >
                    <Undo2 className="w-5 h-5" />
                    Undo Last Ball
                  </Button>

                  {match.currentInnings === 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="secondary" className="w-full h-12 gap-2">
                          <RefreshCw className="w-5 h-5" />
                          Switch to Innings 2
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Switch Innings?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will end the current innings and start innings 2 with {team2?.name} batting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSwitchInnings}>
                            Switch Innings
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full h-12 gap-2">
                        <Flag className="w-5 h-5" />
                        End Match
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>End Match?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will finalize the match result and add it to the points table.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEndMatch}>
                          End Match
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-16 space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">No Active Match</h2>
                <p className="text-muted-foreground mb-6">Start a new match to begin scoring</p>
                <Link to="/match-setup">
                  <Button size="lg" className="gap-2">
                    <PlayCircle className="w-5 h-5" />
                    Setup New Match
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminPasswordGate>
  );
}
