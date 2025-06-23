// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { heliosTestnet } from "./lib/chains";

import Home from "./pages/Home";
import Mint from "./pages/Mint";
import History from "./pages/History";
import Faucet from "./pages/Faucet";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion"; // Import AnimatePresence

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const walletConnectProjectId = 'b4a5bd4206fe36062ef6a8f389565fd2';

const config = getDefaultConfig({
  appName: 'Helivault',
  projectId: walletConnectProjectId,
  chains: [heliosTestnet],
  ssr: false,
});

/**
 * AnimatedRoutes component to handle route changes
 */
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="/history" element={<History />} />
        <Route path="/faucet" element={<Faucet />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </HelmetProvider>
);

export default App;