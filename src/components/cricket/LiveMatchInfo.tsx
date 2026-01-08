import { Team, Innings, Match } from '@/lib/cricketTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, User, CircleDot } from 'lucide-react';
import { MATCH_CONSTANTS } from '@/lib/matchConstants';
import { cn } from '@/lib/utils';

interface LiveMatchInfoProps {
  match: Match;
  battingTeam: Team;
  bowlingTeam: Team;
  currentInnings: Innings;
  className?: string;
}

export function LiveMatchInfo({ match, battingTeam, bowlingTeam, currentInnings, className }: LiveMatchInfoProps) {
  // Calculate current run rate
  const totalBalls = currentInnings.currentOver * 6 + currentInnings.currentBall;
  const currentRunRate = totalBalls > 0 ? (currentInnings.runs / totalBalls * 6).toFixed(2) : '0.00';
  
  // Calculate required run rate for 2nd innings
  const target = match.currentInnings === 2 && match.innings1 ? match.innings1.runs + 1 : null;
  const runsNeeded = target ? target - currentInnings.runs : null;
  const ballsRemaining = (MATCH_CONSTANTS.MAX_OVERS * 6) - totalBalls;
  const requiredRunRate = runsNeeded && ballsRemaining > 0 ? (runsNeeded / ballsRemaining * 6).toFixed(2) : null;
  const wicketsRemaining = MATCH_CONSTANTS.MAX_WICKETS - currentInnings.wickets;

  // Get current batsmen
  const currentBatsman = battingTeam.players.find(p => p.id === currentInnings.currentBatsmanId);
  const nonStriker = battingTeam.players.find(p => p.id === currentInnings.nonStrikerBatsmanId);
  const currentBowler = bowlingTeam.players.find(p => p.id === currentInnings.currentBowlerId);

  // Get batsmen stats
  const strikerStats = currentInnings.batterStats[currentInnings.currentBatsmanId || ''];
  const nonStrikerStats = currentInnings.batterStats[currentInnings.nonStrikerBatsmanId || ''];
  const bowlerStats = currentInnings.bowlerStats[currentInnings.currentBowlerId || ''];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Match Info Bar */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {/* Current Run Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                <TrendingUp className="w-3 h-3" />
                CRR
              </div>
              <div className="text-xl font-bold text-primary">{currentRunRate}</div>
            </div>

            {/* Required Run Rate (2nd innings only) */}
            {requiredRunRate && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                  <Target className="w-3 h-3" />
                  RRR
                </div>
                <div className={cn(
                  "text-xl font-bold",
                  parseFloat(requiredRunRate) > parseFloat(currentRunRate) * 1.5 ? "text-destructive" : "text-primary"
                )}>
                  {requiredRunRate}
                </div>
              </div>
            )}

            {/* Target Info (2nd innings) */}
            {target && runsNeeded !== null && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                  <Target className="w-3 h-3" />
                  Need
                </div>
                <div className="text-xl font-bold text-foreground">
                  {runsNeeded > 0 ? runsNeeded : 0}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    from {ballsRemaining}
                  </span>
                </div>
              </div>
            )}

            {/* Wickets Remaining (2nd innings) */}
            {match.currentInnings === 2 && (
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Wickets Left</div>
                <div className="text-xl font-bold text-foreground">{wicketsRemaining}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batsmen & Bowler Info */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Batting Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <CircleDot className="w-3 h-3 mr-1" />
                Batting
              </Badge>
            </div>
            
            <div className="space-y-3">
              {/* Striker */}
              {currentBatsman ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">*</span>
                    <span className="font-medium">{currentBatsman.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold">{strikerStats?.runs || 0}</span>
                    <span className="text-muted-foreground">({strikerStats?.ballsFaced || 0})</span>
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      <span>{strikerStats?.fours || 0}×4</span>
                      <span>{strikerStats?.sixes || 0}×6</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 text-center text-muted-foreground">Select striker</div>
              )}

              {/* Non-Striker */}
              {nonStriker ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">†</span>
                    <span className="font-medium">{nonStriker.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold">{nonStrikerStats?.runs || 0}</span>
                    <span className="text-muted-foreground">({nonStrikerStats?.ballsFaced || 0})</span>
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      <span>{nonStrikerStats?.fours || 0}×4</span>
                      <span>{nonStrikerStats?.sixes || 0}×6</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 text-center text-muted-foreground">Select non-striker</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bowling Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                <User className="w-3 h-3 mr-1" />
                Bowling
              </Badge>
              <span className="text-sm text-muted-foreground ml-auto">{bowlingTeam.name}</span>
            </div>
            
            {currentBowler ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="font-medium">{currentBowler.name}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold">{bowlerStats?.overs || 0}.{bowlerStats?.balls || 0}</div>
                    <div className="text-xs text-muted-foreground">Overs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{bowlerStats?.runs || 0}</div>
                    <div className="text-xs text-muted-foreground">Runs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary">{bowlerStats?.wickets || 0}</div>
                    <div className="text-xs text-muted-foreground">Wkts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">
                      {bowlerStats && (bowlerStats.overs * 6 + bowlerStats.balls) > 0 
                        ? ((bowlerStats.runs / (bowlerStats.overs * 6 + bowlerStats.balls)) * 6).toFixed(1) 
                        : '0.0'}
                    </div>
                    <div className="text-xs text-muted-foreground">Econ</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-muted-foreground">Bowler not selected</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
