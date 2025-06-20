import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Palette,
  ShoppingBag,
  User,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Mint", path: "/" },
    { icon: Palette, label: "Gallery", path: "/gallery" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <Badge
            variant="outline"
            className="bg-warning text-warning-foreground border-warning"
          >
            Announcement
          </Badge>
          <span className="text-warning-foreground">
            Currently powered by Ethereum Testnet - Mint your NFTs for free!
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Helios <span className="text-primary">Gate</span>
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-border/50">
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
                        !isActive && "hover:bg-white/80 text-muted-foreground",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
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
              >
                <div className="w-2 h-2 bg-success rounded-full"></div>
                Helios
                <ChevronDown className="w-4 h-4" />
              </Button>

              {/* Connect Wallet */}
              <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-full px-6">
                0xc0c...9000 ⚡
                <Wallet className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navigation;
