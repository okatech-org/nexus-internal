import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CommsProvider } from "./contexts/CommsContext";
import { DemoProvider } from "./contexts/DemoContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/auth/AuthGuard";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import DemoAccountsPage from "./pages/DemoAccountsPage";
import Debug from "./pages/Debug";
import Simulator from "./pages/Simulator";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// Dashboards
import PlatformAdminDashboard from "./pages/dashboards/PlatformAdminDashboard";
import TenantAdminDashboard from "./pages/dashboards/TenantAdminDashboard";
import ServiceDashboard from "./pages/dashboards/ServiceDashboard";
import DelegatedDashboard from "./pages/dashboards/DelegatedDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <DemoProvider>
            <CommsProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/demo-accounts" element={<DemoAccountsPage />} />
                <Route path="/forbidden" element={<Forbidden />} />
                
                {/* Protected routes - Main App */}
                <Route path="/" element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                } />
                <Route path="/debug" element={
                  <AuthGuard>
                    <Debug />
                  </AuthGuard>
                } />
                <Route path="/simulator" element={
                  <AuthGuard>
                    <Simulator />
                  </AuthGuard>
                } />
                
                {/* Admin Dashboards */}
                <Route path="/admin/platform/*" element={
                  <AuthGuard requiredScopes={['platform:*']}>
                    <PlatformAdminDashboard />
                  </AuthGuard>
                } />
                <Route path="/admin/tenant/*" element={
                  <AuthGuard requiredScopes={['tenant:*']}>
                    <TenantAdminDashboard />
                  </AuthGuard>
                } />
                
                {/* Role-based Dashboards */}
                <Route path="/client" element={
                  <AuthGuard>
                    <ServiceDashboard />
                  </AuthGuard>
                } />
                <Route path="/delegated" element={
                  <AuthGuard>
                    <DelegatedDashboard />
                  </AuthGuard>
                } />
                
                {/* Logout - redirects to login */}
                <Route path="/logout" element={<Login />} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CommsProvider>
          </DemoProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
