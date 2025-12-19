import { useState, useRef, useEffect } from 'react';
import { useCricketStore } from '@/hooks/useCricketStore';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X, Check, ChevronDown, User, Users } from 'lucide-react';
import { PRESET_COLORS, Team, Player, PLAYER_COUNT_OPTIONS } from '@/lib/cricketTypes';
import { cn } from '@/lib/utils';

function PlayerCard({ 
  player, 
  index,
  teamColor,
  onUpdate 
}: { 
  player: Player; 
  index: number;
  teamColor: string;
  onUpdate: (updates: Partial<Player>) => void;
}) {
  const [name, setName] = useState(player.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300000) {
      toast.error('Image too large. Max 300KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 100;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        onUpdate({ photo: base64 });
        toast.success('Photo uploaded!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdate({ name: name.trim() });
      toast.success('Name updated!');
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
      <div
        className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer group overflow-hidden flex-shrink-0"
        style={{ backgroundColor: `hsl(${teamColor} / 0.3)` }}
        onClick={() => fileInputRef.current?.click()}
      >
        {player.photo ? (
          <>
            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
          </>
        ) : (
          <>
            <User className="w-6 h-6 text-muted-foreground" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9"
          placeholder="Player name"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0"
          onClick={handleSaveName}
          disabled={name === player.name || !name.trim()}
        >
          <Check className="w-4 h-4" />
        </Button>
        {player.photo && (
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 text-destructive"
            onClick={() => onUpdate({ photo: null })}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team, onUpdate }: { team: Team; onUpdate: (updates: Partial<Team>) => void }) {
  const [name, setName] = useState(team.name);
  const [selectedColor, setSelectedColor] = useState(team.primaryColor);
  const [playerCount, setPlayerCount] = useState(team.playerCount || 10);
  const [playersOpen, setPlayersOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync playerCount with team when it changes
  useEffect(() => {
    setPlayerCount(team.playerCount || 10);
  }, [team.playerCount]);

  // Ensure players array exists and matches playerCount
  const players = team.players?.slice(0, playerCount) || Array.from({ length: playerCount }, (_, i) => ({
    id: `${team.id}-p${i + 1}`,
    name: `Player ${i + 1}`,
    photo: null,
  }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      toast.error('Image too large. Max 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onUpdate({ logo: base64 });
        toast.success('Logo uploaded!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onUpdate({ logo: null });
    toast.info('Logo removed');
  };

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdate({ name: name.trim() });
      toast.success('Team name updated!');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onUpdate({ primaryColor: color });
  };

  const handlePlayerCountChange = (count: string) => {
    const newCount = parseInt(count);
    setPlayerCount(newCount);
    
    // Create new players array with the correct count
    const currentPlayers = team.players || [];
    let newPlayers: Player[];
    
    if (newCount > currentPlayers.length) {
      // Add new players
      newPlayers = [
        ...currentPlayers,
        ...Array.from({ length: newCount - currentPlayers.length }, (_, i) => ({
          id: `${team.id}-p${currentPlayers.length + i + 1}`,
          name: `Player ${currentPlayers.length + i + 1}`,
          photo: null,
        }))
      ];
    } else {
      // Remove players
      newPlayers = currentPlayers.slice(0, newCount);
    }
    
    onUpdate({ playerCount: newCount, players: newPlayers });
    toast.success(`Team size set to ${newCount} players`);
  };

  const handlePlayerUpdate = (playerIndex: number, updates: Partial<Player>) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], ...updates };
    onUpdate({ players: updatedPlayers });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer group overflow-hidden"
            style={{ backgroundColor: `hsl(${team.primaryColor})` }}
            onClick={() => fileInputRef.current?.click()}
          >
            {team.logo ? (
              <>
                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-white">{team.name.charAt(0)}</span>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Team Logo</p>
            <p className="text-xs text-muted-foreground">Click to upload (max 500KB)</p>
            {team.logo && (
              <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs" onClick={handleRemoveLogo}>
                <X className="w-3 h-3 mr-1" /> Remove
              </Button>
            )}
          </div>
        </div>

        {/* Name Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Team Name</label>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              disabled={name === team.name || !name.trim()}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Color Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Primary Color</label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                className={cn(
                  'w-10 h-10 rounded-full border-2 transition-all',
                  selectedColor === color.value ? 'border-foreground scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: `hsl(${color.value})` }}
                onClick={() => handleColorSelect(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Player Count Section */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Users className="w-4 h-4" />
            Number of Players
          </label>
          <Select value={playerCount.toString()} onValueChange={handlePlayerCountChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select player count" />
            </SelectTrigger>
            <SelectContent>
              {PLAYER_COUNT_OPTIONS.map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  {count} Players
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Players Section */}
        <Collapsible open={playersOpen} onOpenChange={setPlayersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Players ({playerCount})</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", playersOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {players.slice(0, playerCount).map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                index={index}
                teamColor={team.primaryColor}
                onUpdate={(updates) => handlePlayerUpdate(index, updates)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Preview */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Preview</p>
          <div
            className="p-4 rounded-lg"
            style={{
              background: `linear-gradient(135deg, hsl(${team.primaryColor} / 0.9), hsl(${team.primaryColor} / 0.6))`,
            }}
          >
            <TeamBadge team={team} size="md" className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminTeamsTab() {
  const { teams, updateTeam, getTeamsByGroup } = useCricketStore();

  const groupATeams = getTeamsByGroup('A');
  const groupBTeams = getTeamsByGroup('B');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team Management</h2>

      <Tabs defaultValue="A" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="A">Group A</TabsTrigger>
          <TabsTrigger value="B">Group B</TabsTrigger>
        </TabsList>

        <TabsContent value="A">
          <div className="grid md:grid-cols-2 gap-6">
            {groupATeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onUpdate={(updates) => updateTeam(team.id, updates)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="B">
          <div className="grid md:grid-cols-2 gap-6">
            {groupBTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onUpdate={(updates) => updateTeam(team.id, updates)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
