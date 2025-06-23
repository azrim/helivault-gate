// src/components/Navigation.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Palette,
  ShoppingBag,
  Menu,
  X,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navigation = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Palette, label: "Mint", path: "/mint" },
    { icon: Droplets, label: "Faucet", path: "/faucet" },
    { icon: ShoppingBag, label: "History", path: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/helios-icon.png" 
              alt="Helios Icon"
              className="h-8 w-8 rounded-full" 
            />
            <span className="text-xl font-bold text-foreground">
              Helivault <span className="text-primary">Gate</span>
            </span>
          </Link>

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

          <div className="hidden md:flex items-center gap-3">
            <ConnectButton />
          </div>

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

        {mobileOpen && (
          <div className="absolute right-4 top-16 z-50 w-72 bg-white border border-border rounded-xl p-4 space-y-4 shadow-xl md:hidden">
            <div className="space-y-2">
              {navItems.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg font-medium",
                    location.pathname === path
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;