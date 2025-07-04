// src/components/MobileBottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Droplets, Flame, ArrowLeftRight, Rocket, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useNavigationContext } from "@/context/NavigationContext";

// Define the type for our navigation items
type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

// Define the navigation items with the new icons
const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/mint", label: "Mint", icon: Sparkles },
  { path: "/faucet", label: "Faucet", icon: Droplets },
  { path: "/checkin", label: "Check-in", icon: Flame },
];

const NavLink = ({ path, icon: Icon, label }: NavItem) => {
  const location = useLocation();
  const { setDirection } = useNavigationContext();
  const isActive = location.pathname === path;

  const handleClick = () => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    const newIndex = navItems.findIndex(item => item.path === path);
    // Corrected the logic here
    if (newIndex > currentIndex) {
      setDirection('right');
    } else {
      setDirection('left');
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={path}
            onClick={handleClick}
            className={cn(
              "relative flex items-center h-12 rounded-full transition-all duration-300 ease-out",
              isActive ? "text-primary-foreground gap-2 pr-4 pl-3" : "w-12 justify-center text-muted-foreground hover:bg-white/10"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-mobile-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <div className="relative z-10">
              <Icon className="h-6 w-6" />
            </div>
            {isActive && (
              <span className="relative z-10 text-sm font-medium">{label}</span>
            )}
          </Link>
        </TooltipTrigger>
        {!isActive && (
          <TooltipContent side="top"><p>{label}</p></TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};


export const MobileBottomNav = () => {
  return (
    // This container is now docked to the bottom, not floating
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-background/80 backdrop-blur-lg border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink key={item.path} {...item} />
        ))}
      </div>
    </nav>
  );
};