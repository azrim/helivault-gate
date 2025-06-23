// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { heliosTestnet } from "./lib/chains"; // Import your custom chain

import Home from "./pages/Home";
import Mint from "./pages/Mint";
import History from "./pages/History";
import Faucet from "./pages/Faucet";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// --- IMPORTANT ---
const walletConnectProjectId = 'b4a5bd4206fe36062ef6a8f389565fd2';

// Configure Wagmi and RainbowKit
const config = getDefaultConfig({
  appName: 'Helivault',
  projectId: walletConnectProjectId,
  chains: [heliosTestnet],
  ssr: false, // This is a client-side only app
});

const App = () => (
  <HelmetProvider>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mint" element={<Mint />} />
                <Route path="/history" element={<History />} />
                <Route path="/faucet" element={<Faucet />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </HelmetProvider>
);

export default App;