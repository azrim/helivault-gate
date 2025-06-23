import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CustomConnectButton } from "./CustomConnectButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

// The type no longer needs an icon
type NavItemProps = {
  path: string;
  label: string;
};

// The array is now simpler
const navItems: NavItemProps[] = [
  { path: "/", label: "Home" },
  { path: "/mint", label: "Mint" },
  { path: "/faucet", label: "Faucet" },
  { path: "/history", label: "History" },
];

/**
 * Reusable NavLink component with the gradient underline indicator
 */
const NavLink = ({ path, label }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      // The link is now a relative container for the absolute underline
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-foreground" // Active text is bright
          : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      {label}
      {/* The gradient underline, rendered only if the link is active */}
      {isActive && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full" />
      )}
    </Link>
  );
};

/**
 * Main Navigation Component
 */
const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-3 items-center">
          
          {/* Left Column */}
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

          {/* Center Column: Text-based navigation */}
          <nav className="hidden md:flex items-center justify-center gap-4">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </nav>

          {/* Right Column */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden sm:block">
              <CustomConnectButton />
            </div>
            <ThemeSwitcher />
            
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="grid gap-4 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="pt-4 border-t">
                       <CustomConnectButton />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;