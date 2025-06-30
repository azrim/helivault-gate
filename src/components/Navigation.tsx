// src/components/Navigation.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CustomConnectButton } from "./CustomConnectButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "./MobileBottomNav";
import { motion } from "framer-motion";
import { useNavigationContext } from "@/context/NavigationContext";

// --- Desktop Navigation Link ---
type DesktopNavItemProps = {
  path: string;
  label: string;
};

const desktopNavItems: DesktopNavItemProps[] = [
  { path: "/", label: "Home" },
  { path: "/mint", label: "Mint" },
  { path: "/faucet", label: "Faucet" },
  { path: "/checkin", label: "Check-in" },
];

const DesktopNavLink = ({ path, label }: DesktopNavItemProps) => {
  const location = useLocation();
  const { setDirection } = useNavigationContext();
  const isActive = location.pathname === path;

  const handleClick = () => {
    const currentIndex = desktopNavItems.findIndex(item => item.path === location.pathname);
    const newIndex = desktopNavItems.findIndex(item => item.path === path);
    // Corrected the logic here
    if (newIndex > currentIndex) {
      setDirection('right');
    } else {
      setDirection('left');
    }
  };

  return (
    <Link
      to={path}
      onClick={handleClick}
      className={cn(
        "relative px-3 py-3 text-sm font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      {label}
      {isActive && (
        <motion.div
          className="absolute bottom-1.5 left-0 right-0 mx-auto h-0.5 w-3/5 rounded-full bg-gradient-to-r from-purple-500 to-blue-400"
          layoutId="desktop-nav-indicator"
        />
      )}
    </Link>
  );
};

// --- Mobile Top Header ---
const MobileTopHeader = () => {
  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between h-16 px-4">
            <Link to="/" className="flex items-center gap-2">
                <img src="/helios-icon.png" alt="Helios Icon" className="h-8 w-8 rounded-full" />
                <span className="font-bold text-lg">Helivault</span>
            </Link>
            <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <CustomConnectButton />
            </div>
        </div>
    </header>
  );
}


/**
 * Main Navigation Component - Renders the correct layout for mobile vs desktop
 */
const Navigation = () => {
  const isMobile = useIsMobile();

  // On mobile, render a top header AND the bottom navigation bar
  if (isMobile) {
    return (
      <>
        <MobileTopHeader />
        <MobileBottomNav />
      </>
    );
  }

  // On desktop, render the original top header
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-3 items-center">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/helios-icon.png" 
                alt="Helios Icon"
                className="h-8 w-8 rounded-full" 
              />
              <span className="hidden sm:block text-xl font-bold text-foreground whitespace-nowrap">
                Helivault Gate
              </span>
            </Link>
          </div>
          <nav className="flex items-center justify-center gap-4">
            {desktopNavItems.map((item) => (
              <DesktopNavLink key={item.path} {...item} />
            ))}
          </nav>
          <div className="flex items-center justify-end gap-3">
            <CustomConnectButton />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;