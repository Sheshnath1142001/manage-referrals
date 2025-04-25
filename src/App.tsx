
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FoodTruckDetails from "./pages/FoodTruckDetails";
import SearchResults from "./pages/SearchResults";
import OwnerDashboard from "./pages/OwnerDashboard";
import BusinessRegistration from "./pages/BusinessRegistration";
import BusinessProfile from "./pages/BusinessProfile";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Layout from "./components/Layout";

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/food-trucks/:id" element={<Layout><FoodTruckDetails /></Layout>} />
              <Route path="/search" element={<Layout><SearchResults /></Layout>} />
              <Route path="/owner-dashboard" element={<Layout><OwnerDashboard /></Layout>} />
              <Route path="/business-registration" element={<Layout><BusinessRegistration /></Layout>} />
              <Route path="/business/:id" element={<Layout><BusinessProfile /></Layout>} />
              <Route path="/signin" element={<Layout><SignIn /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
