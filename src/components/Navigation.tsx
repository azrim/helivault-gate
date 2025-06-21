import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Palette,
  ShoppingBag,
  Wallet,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";

const Navigation = () => {
  const location = useLocation();
  const {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    networkName,
    isCorrectNetwork,
    switchToHelios,
  } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Palette, label: "Mint", path: "/mint" },
    { icon: ShoppingBag, label: "History", path: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Helivault <span className="text-primary">Gate</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-border/50">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 rounded-full h-9 px-4 font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "hover:bg-white/80 text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Network */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/60 border-border/50"
              onClick={!isCorrectNetwork ? switchToHelios : undefined}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isCorrectNetwork ? "bg-success" : "bg-warning"
                }`}
              ></div>
              {networkName}
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* Wallet */}
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="gap-2 bg-primary hover:bg-primary/90 rounded-full px-6"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
                <Wallet className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="gap-2 bg-white/60 border-border/50 rounded-full px-4"
                >
                  {formatAddress(address!)} ⚡
                </Button>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="bg-white/60 border-border/50 rounded-full p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="absolute right-4 top-16 z-50 w-72 bg-white border border-border rounded-xl p-4 space-y-4 shadow-xl md:hidden">
            {/* Nav Links */}
            <div className="space-y-2">
              {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg font-medium",
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Network Selector */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground mb-1 block">
                Network
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={!isCorrectNetwork ? switchToHelios : undefined}
                className="w-full justify-start gap-2"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCorrectNetwork ? "bg-success" : "bg-warning"
                  }`}
                ></div>
                {networkName}
                <ChevronDown className="w-4 h-4 ml-auto" />
              </Button>
            </div>

            {/* Wallet Info */}
            <div className="pt-2 border-t border-border space-y-2">
              {!isConnected ? (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                  <Wallet className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground flex justify-between items-center">
                    <span>{formatAddress(address!)}</span>
                    <button
                      onClick={disconnectWallet}
                      className="text-red-500 hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
