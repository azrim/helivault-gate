// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { heliosTestnet } from "./lib/chains";
import { AnimatePresence } from "framer-motion";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Mint from "./pages/Mint";
import Faucet from "./pages/Faucet";
import CheckIn from "./pages/CheckIn";
import Deploy from "./pages/Deploy";
import NotFound from "./pages/NotFound";
import Gallery from "./pages/Gallery";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import PageWrapper from "./components/PageWrapper";
import { NavigationProvider, useNavigationContext } from "./context/NavigationContext";

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();
const walletConnectProjectId = 'b4a5bd4206fe36062ef6a8f389565fd2';

const config = getDefaultConfig({
  appName: 'Helivault',
  projectId: walletConnectProjectId,
  chains: [heliosTestnet],
  ssr: false,
});

const AnimatedRoutes = () => {
  const location = useLocation();
  const { direction } = useNavigationContext();

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 4rem)' }}>
      <AnimatePresence initial={false} custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/mint" element={<PageWrapper><Mint /></PageWrapper>} />
          <Route path="/faucet" element={<PageWrapper><Faucet /></PageWrapper>} />
          <Route path="/checkin" element={<PageWrapper><CheckIn /></PageWrapper>} />
          <Route path="/deploy" element={<PageWrapper><Deploy /></PageWrapper>} />
          <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <HelmetProvider>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <NavigationProvider>
                <BrowserRouter>
                  <Navigation />
                  <AnimatedRoutes />
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