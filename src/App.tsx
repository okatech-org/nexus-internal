import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CommsProvider } from "./contexts/CommsContext";
import { DemoProvider } from "./contexts/DemoContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DemoAccountsPage from "./pages/DemoAccountsPage";
import Debug from "./pages/Debug";
import Simulator from "./pages/Simulator";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

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
                
                {/* Protected routes */}
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
