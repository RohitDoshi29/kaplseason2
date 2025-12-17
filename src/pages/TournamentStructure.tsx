import { useCricketStore } from '@/hooks/useCricketStore';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function TournamentStructure() {
  const { teams, getTeamStats } = useCricketStore();
  const stats = getTeamStats();

  const getGroupRankings = (group: 'A' | 'B') => {
    const groupTeams = teams.filter(t => t.group === group);
    return groupTeams
      .map(team => ({
        team,
        totalRuns: stats.find(s => s.teamId === team.id)?.totalRuns || 0,
      }))
      .sort((a, b) => b.totalRuns - a.totalRuns);
  };

  const groupARankings = getGroupRankings('A');
  const groupBRankings = getGroupRankings('B');

  const a1 = groupARankings[0]?.team;
  const a2 = groupARankings[1]?.team;
  const b1 = groupBRankings[0]?.team;
  const b2 = groupBRankings[1]?.team;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <Navigation />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Group Stage */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Group A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupARankings.map((item, index) => (
                <div
                  key={item.team.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    index < 2 ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg w-6">{index + 1}</span>
                    <TeamBadge team={item.team} size="sm" />
                  </div>
                  {index < 2 && (
                    <span className="text-xs font-semibold text-primary">QUALIFIED</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupBRankings.map((item, index) => (
                <div
                  key={item.team.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    index < 2 ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg w-6">{index + 1}</span>
                    <TeamBadge team={item.team} size="sm" />
                  </div>
                  {index < 2 && (
                    <span className="text-xs font-semibold text-primary">QUALIFIED</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Knockout Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Knockout Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-8">
              {/* Semi Finals */}
              <div className="w-full">
                <h3 className="text-center font-semibold text-muted-foreground mb-4">SEMI-FINALS</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* SF1: A1 vs B2 */}
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-3 text-center">Semi-Final 1</p>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        {a1 ? (
                          <TeamBadge team={a1} size="md" showName={true} className="justify-center flex-col" />
                        ) : (
                          <span className="text-muted-foreground">A1</span>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">Group A #1</span>
                      </div>
                      <span className="text-xl font-bold px-4">vs</span>
                      <div className="text-center flex-1">
                        {b2 ? (
                          <TeamBadge team={b2} size="md" showName={true} className="justify-center flex-col" />
                        ) : (
                          <span className="text-muted-foreground">B2</span>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">Group B #2</span>
                      </div>
                    </div>
                  </div>

                  {/* SF2: B1 vs A2 */}
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-3 text-center">Semi-Final 2</p>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        {b1 ? (
                          <TeamBadge team={b1} size="md" showName={true} className="justify-center flex-col" />
                        ) : (
                          <span className="text-muted-foreground">B1</span>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">Group B #1</span>
                      </div>
                      <span className="text-xl font-bold px-4">vs</span>
                      <div className="text-center flex-1">
                        {a2 ? (
                          <TeamBadge team={a2} size="md" showName={true} className="justify-center flex-col" />
                        ) : (
                          <span className="text-muted-foreground">A2</span>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">Group A #2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Lines */}
              <div className="w-px h-8 bg-border" />

              {/* Final */}
              <div className="w-full max-w-md">
                <h3 className="text-center font-semibold text-cricket-accent mb-4">🏆 FINAL</h3>
                <div className="bg-gradient-to-r from-cricket-primary to-cricket-secondary rounded-xl p-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <span className="text-sm font-bold">SF1</span>
                      </div>
                      <span className="text-sm">Winner SF1</span>
                    </div>
                    <span className="text-2xl font-bold px-4">vs</span>
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <span className="text-sm font-bold">SF2</span>
                      </div>
                      <span className="text-sm">Winner SF2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
