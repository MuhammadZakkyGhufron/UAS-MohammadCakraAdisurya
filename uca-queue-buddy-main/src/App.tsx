import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueueProvider } from "@/context/QueueContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CustomerPage from "./pages/CustomerPage";
import DisplayPage from "./pages/DisplayPage";
import OfficerPage from "./pages/OfficerPage";
import StatisticsPage from "./pages/StatisticsPage";
import AuthPage from "./pages/AuthPage";
import UserManagementPage from "./pages/UserManagementPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <QueueProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/display" element={<DisplayPage />} />
              <Route path="/officer" element={<OfficerPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/admins" element={<AdminManagementPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueueProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
