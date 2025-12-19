import { useCricketStore } from '@/hooks/useCricketStore';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MATCH_TYPE_LABELS } from '@/lib/cricketTypes';
import { Badge } from '@/components/ui/badge';

export default function PointsTable() {
  const { teams, getTeamStats, getTeam, matchHistory } = useCricketStore();
  const stats = getTeamStats();

  const groupATeams = teams.filter(t => t.group === 'A');
  const groupBTeams = teams.filter(t => t.group === 'B');

  const getTeamStatsSorted = (groupTeams: typeof teams) => {
    return groupTeams
      .map(team => {
        const teamStats = stats.find(s => s.teamId === team.id);
        return {
          team,
          matchesPlayed: teamStats?.matchesPlayed || 0,
          totalRuns: teamStats?.totalRuns || 0,
        };
      })
      .sort((a, b) => b.totalRuns - a.totalRuns);
  };

  const renderTable = (title: string, groupTeams: typeof teams) => {
    const sortedTeams = getTeamStatsSorted(groupTeams);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: `hsl(${groupTeams[0]?.primaryColor})` }}
            />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Matches</TableHead>
                <TableHead className="text-right">Runs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeams.map((item, index) => (
                <TableRow key={item.team.id}>
                  <TableCell className="font-bold">{index + 1}</TableCell>
                  <TableCell>
                    <TeamBadge team={item.team} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">{item.matchesPlayed}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-bold text-lg',
                      item.totalRuns < 0 && 'text-destructive'
                    )}
                  >
                    {item.totalRuns}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const completedMatches = matchHistory.filter(m => m.status === 'completed');

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <Navigation />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {renderTable('Group A', groupATeams)}
          {renderTable('Group B', groupBTeams)}
        </div>

        {/* Match History */}
        {completedMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match Type</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Winner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedMatches.map(match => {
                    const team1 = getTeam(match.team1Id);
                    const team2 = getTeam(match.team2Id);
                    const winner = match.winner ? getTeam(match.winner) : null;
                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          <Badge variant={match.matchType === 'final' ? 'default' : 'secondary'}>
                            {MATCH_TYPE_LABELS[match.matchType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {team1 && <TeamBadge team={team1} size="sm" />}
                            <span className="text-muted-foreground">vs</span>
                            {team2 && <TeamBadge team={team2} size="sm" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {match.innings1?.runs || 0}/{match.innings1?.wickets || 0} - {match.innings2?.runs || 0}/{match.innings2?.wickets || 0}
                        </TableCell>
                        <TableCell>
                          {winner && <TeamBadge team={winner} size="sm" />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
