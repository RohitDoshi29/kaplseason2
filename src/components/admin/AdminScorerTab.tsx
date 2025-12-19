import { useCricketStore } from '@/hooks/useCricketStore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Undo2, RefreshCw, Flag, PlayCircle, Target, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdminScorerTabProps {
  onNavigateToSetup: () => void;
}

export default function AdminScorerTab({ onNavigateToSetup }: AdminScorerTabProps) {
  const { matchState, getTeam, addBall, undoLastBall, switchBattingTeam, endMatch, selectBatsman, selectBowler } = useCricketStore();
  const match = matchState.currentMatch;

  const team1 = match ? getTeam(match.team1Id) : null;
  const team2 = match ? getTeam(match.team2Id) : null;
  const currentInnings = match?.currentInnings === 1 ? match.innings1 : match?.innings2;
  const battingTeam = match?.currentInnings === 1 ? team1 : team2;
  const bowlingTeam = match?.currentInnings === 1 ? team2 : team1;
  
  // Target for 2nd innings
  const target = match?.currentInnings === 2 && match.innings1 ? match.innings1.runs + 1 : null;
  const runsNeeded = target && currentInnings ? target - currentInnings.runs : null;

  const handleAddBall = (runs: number, isWicket = false, isWide = false, isNoBall = false) => {
    if (!currentInnings?.currentBatsmanId || !currentInnings?.currentBowlerId) {
      toast.error('Please select batsman and bowler first');
      return;
    }
    
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

  // Get current batsman and bowler info
  const currentBatsman = battingTeam?.players.find(p => p.id === currentInnings?.currentBatsmanId);
  const nonStriker = battingTeam?.players.find(p => p.id === currentInnings?.nonStrikerBatsmanId);
  const currentBowler = bowlingTeam?.players.find(p => p.id === currentInnings?.currentBowlerId);

  // Get available players for selection (not out batsmen)
  const availableBatsmen = battingTeam?.players.filter(p => {
    const stats = currentInnings?.batterStats[p.id];
    return !stats?.isOut && p.id !== currentInnings?.currentBatsmanId && p.id !== currentInnings?.nonStrikerBatsmanId;
  }) || [];

  const availableBowlers = bowlingTeam?.players || [];

  if (!match || !team1 || !team2 || !currentInnings || !battingTeam || !bowlingTeam) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">No Active Match</h2>
          <p className="text-muted-foreground mb-6">Start a new match to begin scoring</p>
          <Button size="lg" className="gap-2" onClick={onNavigateToSetup}>
            <PlayCircle className="w-5 h-5" />
            Setup New Match
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Current Score with Target */}
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
              {target && (
                <div className="flex items-center justify-end gap-1 mt-1 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium">Target: {target}</span>
                  <span className="text-muted-foreground">
                    (Need {runsNeeded} runs)
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Batsman & Bowler Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Batting Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Batting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Striker</label>
              <Select
                value={currentInnings.currentBatsmanId || ''}
                onValueChange={(value) => selectBatsman(value, true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select striker" />
                </SelectTrigger>
                <SelectContent>
                  {battingTeam.players.map((player) => {
                    const stats = currentInnings.batterStats[player.id];
                    const isOut = stats?.isOut;
                    const isNonStriker = player.id === currentInnings.nonStrikerBatsmanId;
                    return (
                      <SelectItem 
                        key={player.id} 
                        value={player.id}
                        disabled={isOut || isNonStriker}
                      >
                        {player.name} {isOut ? '(OUT)' : isNonStriker ? '(Non-striker)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Non-Striker</label>
              <Select
                value={currentInnings.nonStrikerBatsmanId || ''}
                onValueChange={(value) => selectBatsman(value, false)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select non-striker" />
                </SelectTrigger>
                <SelectContent>
                  {battingTeam.players.map((player) => {
                    const stats = currentInnings.batterStats[player.id];
                    const isOut = stats?.isOut;
                    const isStriker = player.id === currentInnings.currentBatsmanId;
                    return (
                      <SelectItem 
                        key={player.id} 
                        value={player.id}
                        disabled={isOut || isStriker}
                      >
                        {player.name} {isOut ? '(OUT)' : isStriker ? '(Striker)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bowling Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Bowling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Current Bowler</label>
              <Select
                value={currentInnings.currentBowlerId || ''}
                onValueChange={(value) => selectBowler(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bowler" />
                </SelectTrigger>
                <SelectContent>
                  {bowlingTeam.players.map((player) => {
                    const stats = currentInnings.bowlerStats[player.id];
                    return (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} {stats ? `(${stats.overs}.${stats.balls}-${stats.runs}-${stats.wickets})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batting Stats Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Batting Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batsman</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">B</TableHead>
                <TableHead className="text-center">4s</TableHead>
                <TableHead className="text-center">6s</TableHead>
                <TableHead className="text-center">SR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentInnings.battingOrder.map((playerId) => {
                const player = battingTeam.players.find(p => p.id === playerId);
                const stats = currentInnings.batterStats[playerId];
                if (!player || !stats) return null;
                
                const strikeRate = stats.ballsFaced > 0 
                  ? ((stats.runs / stats.ballsFaced) * 100).toFixed(1) 
                  : '0.0';
                const isStriker = playerId === currentInnings.currentBatsmanId;
                const isNonStriker = playerId === currentInnings.nonStrikerBatsmanId;
                
                return (
                  <TableRow key={playerId} className={isStriker ? 'bg-primary/10' : ''}>
                    <TableCell className="font-medium">
                      {player.name}
                      {isStriker && <span className="text-primary ml-1">*</span>}
                      {isNonStriker && <span className="text-muted-foreground ml-1">†</span>}
                      {stats.isOut && <span className="text-destructive ml-1">(OUT)</span>}
                    </TableCell>
                    <TableCell className="text-center font-bold">{stats.runs}</TableCell>
                    <TableCell className="text-center">{stats.ballsFaced}</TableCell>
                    <TableCell className="text-center">{stats.fours}</TableCell>
                    <TableCell className="text-center">{stats.sixes}</TableCell>
                    <TableCell className="text-center">{strikeRate}</TableCell>
                  </TableRow>
                );
              })}
              {currentInnings.battingOrder.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Select batsmen to start
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bowling Stats Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Bowling Figures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bowler</TableHead>
                <TableHead className="text-center">O</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">WD</TableHead>
                <TableHead className="text-center">NB</TableHead>
                <TableHead className="text-center">Econ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(currentInnings.bowlerStats).map(([playerId, stats]) => {
                const player = bowlingTeam.players.find(p => p.id === playerId);
                if (!player) return null;
                
                const totalOvers = stats.overs + (stats.balls / 6);
                const economy = totalOvers > 0 ? (stats.runs / totalOvers).toFixed(2) : '0.00';
                const isBowling = playerId === currentInnings.currentBowlerId;
                
                return (
                  <TableRow key={playerId} className={isBowling ? 'bg-primary/10' : ''}>
                    <TableCell className="font-medium">
                      {player.name}
                      {isBowling && <span className="text-primary ml-1">*</span>}
                    </TableCell>
                    <TableCell className="text-center">{stats.overs}.{stats.balls}</TableCell>
                    <TableCell className="text-center">{stats.runs}</TableCell>
                    <TableCell className="text-center font-bold">{stats.wickets}</TableCell>
                    <TableCell className="text-center">{stats.wides}</TableCell>
                    <TableCell className="text-center">{stats.noBalls}</TableCell>
                    <TableCell className="text-center">{economy}</TableCell>
                  </TableRow>
                );
              })}
              {Object.keys(currentInnings.bowlerStats).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Select a bowler to start
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
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
                  disabled={!currentInnings.currentBatsmanId || !currentInnings.currentBowlerId}
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
                disabled={!currentInnings.currentBatsmanId || !currentInnings.currentBowlerId}
              >
                4
              </Button>
              <Button
                className="h-14 text-xl font-bold bg-cricket-six hover:bg-cricket-six/90"
                onClick={() => handleAddBall(6)}
                disabled={!currentInnings.currentBatsmanId || !currentInnings.currentBowlerId}
              >
                6
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
                disabled={!currentInnings.currentBatsmanId || !currentInnings.currentBowlerId}
              >
                Wide
              </Button>
              <Button
                className="h-12 font-bold bg-cricket-extra text-black hover:bg-cricket-extra/90"
                onClick={() => handleAddBall(1, false, false, true)}
                disabled={!currentInnings.currentBatsmanId || !currentInnings.currentBowlerId}
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
            disabled={!currentInnings.currentBatsmanId || !currentInnings.currentBowlerId}
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
                    Target for {team2?.name}: {(currentInnings?.runs || 0) + 1} runs
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
    </div>
  );
}
