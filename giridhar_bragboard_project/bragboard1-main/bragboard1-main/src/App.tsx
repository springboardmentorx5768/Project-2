import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import ShoutOuts from "./pages/ShoutOuts";
import Team from "./pages/Team";
import Achievements from "./pages/Achievements";
import Goals from "./pages/Goals";
import Activity from "./pages/Activity";
import Bookmarks from "./pages/Bookmarks";
import Calendar from "./pages/Calendar";
import NotificationsList from "./pages/NotificationsList";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shout-outs" element={<ShoutOuts />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<NotificationsList />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
