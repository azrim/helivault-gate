import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Palette,
  ShoppingBag,
  Wallet,
  ChevronDown,
  LogOut,
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Palette, label: "Mint", path: "/mint" },
    { icon: ShoppingBag, label: "History", path: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between flex-wrap gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Helivault <span className="text-primary">Gate</span>
            </span>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-border/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2 rounded-full h-9 px-4 font-medium",
                        isActive &&
                          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                        !isActive && "hover:bg-white/80 text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

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
              <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
