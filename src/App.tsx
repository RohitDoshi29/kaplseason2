import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MatchSetup from "./pages/MatchSetup";
import AdminPanel from "./pages/AdminPanel";
import PointsTable from "./pages/PointsTable";
import TournamentStructure from "./pages/TournamentStructure";
import TeamManagement from "./pages/TeamManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/match-setup" element={<MatchSetup />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/points" element={<PointsTable />} />
          <Route path="/bracket" element={<TournamentStructure />} />
          <Route path="/teams" element={<TeamManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
