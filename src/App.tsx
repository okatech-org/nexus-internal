import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CommsProvider } from "./contexts/CommsContext";
import { DemoProvider } from "./contexts/DemoContext";
import Index from "./pages/Index";
import Debug from "./pages/Debug";
import Simulator from "./pages/Simulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoProvider>
        <CommsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/debug" element={<Debug />} />
              <Route path="/simulator" element={<Simulator />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CommsProvider>
      </DemoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
