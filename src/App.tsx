// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { AnimatePresence } from "framer-motion";
import { config, wagmiAdapter, networks, projectId } from "./config/reown";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Mint from "./pages/Mint";
import Faucet from "./pages/Faucet";
import Deploy from "./pages/Deploy";
import Lottery from "./pages/Lottery";
import NotFound from "./pages/NotFound";
import Gallery from "./pages/Gallery";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { DeploymentProvider } from "./context/DeploymentContext";
import {
  NavigationProvider,
  useNavigationContext,
} from "./context/NavigationContext";

const queryClient = new QueryClient();

const metadata = {
  name: "Helivault Gate",
  description: "A dApp for the Helios testnet.",
  url: window.location.origin,
  icons: [`${window.location.origin}/helios-icon.png`],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
});

const AnimatedRoutes = () => {
  const location = useLocation();
  const { direction } = useNavigationContext();

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence initial={false} custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/faucet" element={<Faucet />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/lottery" element={<Lottery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DeploymentProvider>
              <NavigationProvider>
                <Navigation />
                <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <AnimatedRoutes />
                </main>
              </NavigationProvider>
            </DeploymentProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
