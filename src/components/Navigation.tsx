import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Palette, label: "Mint", path: "/mint" },
    { icon: ShoppingBag, label: "History", path: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Network Selector */}
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

            {/* Connect Wallet */}
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
              <div className="hidden md:flex items-center gap-2">
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
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileOpen && (
          <div className="md:hidden mt-3 bg-white border border-border rounded-xl p-4 space-y-3">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg font-medium",
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </Link>
              );
            })}

            {isConnected && (
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{formatAddress(address!)}</span>
                  <button
                    onClick={disconnectWallet}
                    className="text-red-500 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
