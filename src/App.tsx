// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { heliosTestnet, sepolia, bscTestnet, avalancheFuji } from "./lib/chains";
import { AnimatePresence } from "framer-motion";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Mint from "./pages/Mint";
import Bridge from "./pages/Bridge";
import Deploy from "./pages/Deploy";
import Faucet from "./pages/Faucet";
import NotFound from "./pages/NotFound";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import PageWrapper from "./components/PageWrapper";
import { NavigationProvider, useNavigationContext } from "./context/NavigationContext";

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();
const walletConnectProjectId = 'b4a5bd4206fe3606166Ffd9aaD9c0b18';

const config = getDefaultConfig({
  appName: 'Helivault',
  projectId: walletConnectProjectId,
  chains: [heliosTestnet, sepolia, bscTestnet, avalancheFuji],
  ssr: false,
});

const AnimatedRoutes = () => {
  const location = useLocation();
  const { direction } = useNavigationContext();

  return (
    <AnimatePresence initial={false} custom={direction}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/bridge" element={<PageWrapper><Bridge /></PageWrapper>} />
        <Route path="/deploy" element={<PageWrapper><Deploy /></PageWrapper>} />
        <Route path="/mint" element={<PageWrapper><Mint /></PageWrapper>} />
        <Route path="/faucet" element={<PageWrapper><Faucet /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <Sonner />
              <NavigationProvider>
                <BrowserRouter>
                  {/* This layout makes the main content area scrollable */}
                  <div className="flex h-screen flex-col">
                    <Navigation />
                    <main className="flex-1 overflow-y-auto">
                      <div className="relative">
                        <AnimatedRoutes />
                      </div>
                    </main>
                  </div>
                </BrowserRouter>
              </NavigationProvider>
            </TooltipProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </HelmetProvider>
);

export default App;