import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Droplets, History, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
  { path: "/history", label: "History", icon: History },
];

const NavLink = ({ path, icon: Icon, label }: NavItem) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={path}
            className={cn(
              "relative flex items-center h-12 rounded-full transition-all duration-300 ease-out",
              isActive ? "text-primary-foreground gap-2 pr-4 pl-3" : "w-12 justify-center text-muted-foreground hover:bg-white/10"
            )}
          >
            {/* This is the blue pill that slides behind the active item */}
            {isActive && (
              <motion.div
                layoutId="active-mobile-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            {/* Icon is always visible and on a higher layer */}
            <div className="relative z-10">
              <Icon className="h-6 w-6" />
            </div>

            {/* Label is rendered only when active */}
            {isActive && (
              <span className="relative z-10 text-sm font-medium">
                {label}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        {/* Tooltip appears on hover for inactive items */}
        {!isActive && (
          <TooltipContent side="top">
            <p>{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};


export const MobileBottomNav = () => {
  return (
    // This container is now docked to the bottom, not floating
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-neutral-900/90 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink key={item.path} {...item} />
        ))}
      </div>
    </nav>
  );
};