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
import Deploy from "./pages/Deploy";
import Lottery from "./pages/Lottery";
import NotFound from "./pages/NotFound";
import Gallery from "./pages/Gallery";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { useIsMobile } from "./hooks/use-mobile";
import { DeploymentProvider } from "./context/DeploymentContext";
import {
  NavigationProvider,
  useNavigationContext,
} from "./context/NavigationContext";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();
const walletConnectProjectId = "b4a5bd4206fe36062ef6a8f389565fd2";

export const config = getDefaultConfig({
  appName: "Helivault",
  projectId: walletConnectProjectId,
  chains: [heliosTestnet],
  ssr: false,
});

const AnimatedRoutes = () => {
  const location = useLocation();
  const { direction } = useNavigationContext();
  const isMobile = useIsMobile();

  // On mobile, we have a top and bottom bar, each 4rem high.
  // On desktop, we only have a top bar, 4rem high.
  const minHeight = isMobile ? "calc(100vh - 8rem)" : "calc(100vh - 4rem)";

  return (
    <div style={{ position: "relative", minHeight }}>
      <AnimatePresence initial={false} custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
                <Home />
            }
          />
          <Route
            path="/mint"
            element={
                <Mint />
            }
          />
          <Route
            path="/faucet"
            element={
                <Faucet />
            }
          />
          <Route
            path="/deploy"
            element={
                <Deploy />
            }
          />
          <Route
            path="/gallery"
            element={
                <Gallery />
            }
          />
          <Route
            path="/lottery"
            element={
                <Lottery />
            }
          />
          <Route
            path="*"
            element={
                <NotFound />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
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
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
