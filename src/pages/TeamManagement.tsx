import { useState, useRef } from 'react';
import { useCricketStore } from '@/hooks/useCricketStore';
import { AdminPasswordGate } from '@/components/cricket/AdminPasswordGate';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, X, Check } from 'lucide-react';
import { PRESET_COLORS, Team } from '@/lib/cricketTypes';
import { cn } from '@/lib/utils';

function TeamCard({ team, onUpdate }: { team: Team; onUpdate: (updates: Partial<Team>) => void }) {
  const [name, setName] = useState(team.name);
  const [selectedColor, setSelectedColor] = useState(team.primaryColor);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Resize to max 200x200
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

export default function TeamManagement() {
  const { teams, updateTeam, getTeamsByGroup } = useCricketStore();

  const groupATeams = getTeamsByGroup('A');
  const groupBTeams = getTeamsByGroup('B');

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-background pb-20 md:pb-4">
        <Navigation />
        <Header />

        <main className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-6">Team Management</h2>

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
        </main>
      </div>
    </AdminPasswordGate>
  );
}
