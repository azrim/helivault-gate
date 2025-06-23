import { Link, useLocation } from "react-router-dom";
import { Home, Palette, Droplets, ShoppingBag, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Define the type for a navigation item for better type safety
type NavItemProps = {
  path: string;
  label: string;
  icon: LucideIcon;
};

// Centralized navigation items array
const navItems: NavItemProps[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/mint", label: "Mint", icon: Palette },
  { path: "/faucet", label: "Faucet", icon: Droplets },
  { path: "/history", label: "History", icon: ShoppingBag },
];

/**
 * Reusable NavLink component
 */
const NavLink = ({ path, icon: Icon, label }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={path}>
          <div
            className={cn(
              "flex items-center justify-center gap-2 h-11 transition-all duration-300 ease-in-out",
              isActive ? "bg-primary text-primary-foreground rounded-full px-4" : "w-11 text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className={cn("font-medium", !isActive && "hidden")}>
              {label}
            </span>
          </div>
        </Link>
      </TooltipTrigger>
      {/* Show tooltip only when the item is inactive and label is hidden */}
      {!isActive && (
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

/**
 * Main Navigation Component
 */
const Navigation = () => {
  return (
    <header className="fixed sticky bottom-0 left-0 z-50 w-full p-4 md:top-0 md:bottom-auto">
      <div className="relative max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - visible on desktop */}
        <Link to="/" className="hidden md:flex items-center gap-3">
          <img 
            src="/helios-icon.png" 
            alt="Helios Icon"
            className="h-8 w-8 rounded-full" 
          />
          <span className="text-xl font-bold text-foreground">
            Helivault <span className="text-primary">Gate</span>
          </span>
        </Link>

        {/* Main Navigation Bar */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full p-2 border shadow-lg">
          {navItems.map((item) => (
            <NavLink key={item.path} {...item} />
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="absolute right-0 flex items-center gap-3">
           <div className="hidden sm:block">
            <ConnectButton />
           </div>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Navigation;