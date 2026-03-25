import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import OverviewPage from "@/pages/OverviewPage";
import CodeBreakdownPage from "@/pages/CodeBreakdownPage";
import MergeAnalyticsPage from "@/pages/MergeAnalyticsPage";
import TeamsPage from "@/pages/TeamsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import SettingsPage from "@/pages/SettingsPage";
import GlossaryPage from "@/pages/GlossaryPage";
import AIToolsPage from "@/pages/AIToolsPage";
import AISummaryPage from "@/pages/AISummaryPage";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import NotFound from "@/pages/NotFound";
import { useAppStore } from "@/store/app-store";

const queryClient = new QueryClient();

// Role-based dashboard router
function RoleBasedDashboard() {
  const { currentRole } = useAppStore();
  if (currentRole === "Developer") return <DeveloperDashboard />;
  if (currentRole === "Manager") return <ManagerDashboard />;
  return <OverviewPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<RoleBasedDashboard />} />
            <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/code-breakdown" element={<CodeBreakdownPage />} />
            <Route path="/ai-tools" element={<AIToolsPage />} />
            <Route path="/ai-summary" element={<AISummaryPage />} />
            <Route path="/merge-analytics" element={<MergeAnalyticsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamsPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

