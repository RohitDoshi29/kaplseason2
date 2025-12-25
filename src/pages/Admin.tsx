import { useState } from 'react';
import { AdminPasswordGate } from '@/components/cricket/AdminPasswordGate';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, PlayCircle, Users, Settings, LogOut, Home, BarChart3, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminScorerTab from '@/components/admin/AdminScorerTab';
import AdminMatchSetupTab from '@/components/admin/AdminMatchSetupTab';
import AdminTeamsTab from '@/components/admin/AdminTeamsTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import PlayerStatsTab from '@/components/admin/PlayerStatsTab';
import { AdminTournamentTab } from '@/components/admin/AdminTournamentTab';
import { toast } from 'sonner';

export default function Admin() {
  const { signOut, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('scorer');

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-background pb-20 md:pb-4">
        <Navigation />
        <Header />

        <main className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm">
                  <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
              <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[180px] md:max-w-none">
                {user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { error } = await signOut();
                if (error) {
                  toast.error('Failed to sign out');
                } else {
                  toast.success('Signed out successfully');
                }
              }}
              className="gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm"
            >
              <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Sign Out
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 max-w-3xl mx-auto">
              <TabsTrigger value="scorer" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Scorer</span>
              </TabsTrigger>
              <TabsTrigger value="setup" className="gap-2">
                <PlayCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Setup</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Teams</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="tournament" className="gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Bracket</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scorer">
              <AdminScorerTab onNavigateToSetup={() => setActiveTab('setup')} />
            </TabsContent>

            <TabsContent value="setup">
              <AdminMatchSetupTab onNavigateToScorer={() => setActiveTab('scorer')} />
            </TabsContent>

            <TabsContent value="teams">
              <AdminTeamsTab />
            </TabsContent>

            <TabsContent value="stats">
              <PlayerStatsTab />
            </TabsContent>

            <TabsContent value="tournament">
              <AdminTournamentTab />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettingsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminPasswordGate>
  );
}
