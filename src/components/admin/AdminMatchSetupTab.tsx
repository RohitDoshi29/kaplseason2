import { useState } from 'react';
import { useCricketStore } from '@/hooks/useCricketStore';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PlayCircle, AlertCircle } from 'lucide-react';

interface AdminMatchSetupTabProps {
  onNavigateToScorer: () => void;
}

export default function AdminMatchSetupTab({ onNavigateToScorer }: AdminMatchSetupTabProps) {
  const { getTeamsByGroup, getTeam, startMatch, matchState } = useCricketStore();
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('A');
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');

  const groupTeams = getTeamsByGroup(selectedGroup);
  const team1 = team1Id ? getTeam(team1Id) : null;
  const team2 = team2Id ? getTeam(team2Id) : null;

  const handleGroupChange = (group: 'A' | 'B') => {
    setSelectedGroup(group);
    setTeam1Id('');
    setTeam2Id('');
  };

  const handleStartMatch = () => {
    if (!team1Id || !team2Id) {
      toast.error('Please select both teams');
      return;
    }
    if (team1Id === team2Id) {
      toast.error('Please select different teams');
      return;
    }
    startMatch(selectedGroup, team1Id, team2Id);
    toast.success('Match started!');
    onNavigateToScorer();
  };

  const hasActiveMatch = !!matchState.currentMatch;

  if (hasActiveMatch) {
    const activeMatch = matchState.currentMatch!;
    const activeTeam1 = getTeam(activeMatch.team1Id);
    const activeTeam2 = getTeam(activeMatch.team2Id);

    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              Match In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              There's already an active match. End the current match before starting a new one.
            </p>
            <div className="flex items-center justify-center gap-4 py-4">
              {activeTeam1 && <TeamBadge team={activeTeam1} size="md" />}
              <span className="text-xl font-bold">vs</span>
              {activeTeam2 && <TeamBadge team={activeTeam2} size="md" />}
            </div>
            <Button className="w-full" onClick={onNavigateToScorer}>
              Go to Scorer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Match Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Selection */}
          <div className="space-y-2">
            <Label>Select Group</Label>
            <Select value={selectedGroup} onValueChange={(v) => handleGroupChange(v as 'A' | 'B')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Group A</SelectItem>
                <SelectItem value="B">Group B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team 1 */}
          <div className="space-y-2">
            <Label>Team 1 (Batting First)</Label>
            <Select value={team1Id} onValueChange={setTeam1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {groupTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id} disabled={team.id === team2Id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${team.primaryColor})` }}
                      />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team 2 */}
          <div className="space-y-2">
            <Label>Team 2</Label>
            <Select value={team2Id} onValueChange={setTeam2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {groupTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id} disabled={team.id === team1Id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${team.primaryColor})` }}
                      />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {team1 && team2 && (
            <div className="py-4 border-t">
              <p className="text-sm text-muted-foreground mb-3 text-center">Match Preview</p>
              <div className="flex items-center justify-center gap-4">
                <TeamBadge team={team1} size="md" />
                <span className="text-xl font-bold text-primary">vs</span>
                <TeamBadge team={team2} size="md" />
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 gap-2"
            onClick={handleStartMatch}
            disabled={!team1Id || !team2Id || team1Id === team2Id}
          >
            <PlayCircle className="w-5 h-5" />
            Start Match
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
