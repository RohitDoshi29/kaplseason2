import { useState } from 'react';
import { AdminPasswordGate } from '@/components/cricket/AdminPasswordGate';
import { Header } from '@/components/cricket/Header';
import { Navigation } from '@/components/cricket/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, PlayCircle, Users, Settings } from 'lucide-react';
import AdminScorerTab from '@/components/admin/AdminScorerTab';
import AdminMatchSetupTab from '@/components/admin/AdminMatchSetupTab';
import AdminTeamsTab from '@/components/admin/AdminTeamsTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('scorer');

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-background pb-20 md:pb-4">
        <Navigation />
        <Header />

        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto">
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

            <TabsContent value="settings">
              <AdminSettingsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminPasswordGate>
  );
}
