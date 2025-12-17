import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCricketStore } from '@/hooks/useCricketStore';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PlayCircle, AlertCircle } from 'lucide-react';

export default function MatchSetup() {
  const navigate = useNavigate();
  const { getTeamsByGroup, getTeam, startMatch, matchState } = useCricketStore();
  const [group, setGroup] = useState<'A' | 'B'>('A');
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');

  const teams = getTeamsByGroup(group);
  const team1 = team1Id ? getTeam(team1Id) : null;
  const team2 = team2Id ? getTeam(team2Id) : null;

  const hasLiveMatch = matchState.currentMatch?.status === 'live';

  const handleStartMatch = () => {
    if (!team1Id || !team2Id) {
      toast.error('Please select both teams');
      return;
    }
    if (team1Id === team2Id) {
      toast.error('Please select different teams');
      return;
    }
    startMatch(group, team1Id, team2Id);
    toast.success('Match started!');
    navigate('/admin');
  };

  const handleGroupChange = (newGroup: 'A' | 'B') => {
    setGroup(newGroup);
    setTeam1Id('');
    setTeam2Id('');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <Navigation />
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">New Match Setup</CardTitle>
            <CardDescription>Select the group and teams for the match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasLiveMatch && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">A match is currently live</p>
                  <p className="text-sm opacity-80">End the current match before starting a new one</p>
                </div>
              </div>
            )}

            {/* Group Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Group</label>
              <Tabs value={group} onValueChange={(v) => handleGroupChange(v as 'A' | 'B')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="A">Group A</TabsTrigger>
                  <TabsTrigger value="B">Group B</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Team Selection */}
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Team 1 (Batting First)</label>
                <Select value={team1Id} onValueChange={setTeam1Id}>
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder="Select team">
                      {team1 && <TeamBadge team={team1} size="sm" />}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === team2Id}>
                        <TeamBadge team={team} size="sm" />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center text-2xl font-bold text-muted-foreground">VS</div>

              <div>
                <label className="text-sm font-medium mb-2 block">Team 2</label>
                <Select value={team2Id} onValueChange={setTeam2Id}>
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder="Select team">
                      {team2 && <TeamBadge team={team2} size="sm" />}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === team1Id}>
                        <TeamBadge team={team} size="sm" />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            {team1 && team2 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-3 text-center">Match Preview</p>
                <div className="flex items-center justify-center gap-4">
                  <TeamBadge team={team1} size="md" />
                  <span className="text-xl font-bold">vs</span>
                  <TeamBadge team={team2} size="md" />
                </div>
              </div>
            )}

            <Button
              onClick={handleStartMatch}
              disabled={!team1Id || !team2Id || team1Id === team2Id || hasLiveMatch}
              className="w-full h-14 text-lg gap-2"
            >
              <PlayCircle className="w-6 h-6" />
              Start Match
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
