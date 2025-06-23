
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CurrentEventProvider } from "@/contexts/CurrentEventContext";
import { EventDataProvider } from "@/contexts/EventDataContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import AdminPortal from "./pages/AdminPortal";
import EventPortal from "./pages/EventPortal";
import NotFound from "./pages/NotFound";
import './i18n'; // Import du système i18n

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <CurrentEventProvider>
        <EventDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/event" element={<Index />} />
                <Route path="/event-portal" element={<EventPortal />} />
                <Route path="/admin" element={<AdminPortal />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </EventDataProvider>
      </CurrentEventProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
