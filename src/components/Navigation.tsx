// src/components/Navigation.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CustomConnectButton } from "./CustomConnectButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "./MobileBottomNav";
import { useNavigationContext } from "@/context/NavigationContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, Palette, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAccount } from "wagmi";

// --- Desktop Navigation Link ---
type DesktopNavItemProps = {
  path: string;
  label: string;
};

const desktopNavItems: DesktopNavItemProps[] = [
  { path: "/", label: "Home" },
  { path: "/mint", label: "Mint" },
  { path: "/gallery", label: "Gallery" },
  { path: "/faucet", label: "Faucet" },
  { path: "/lottery", label: "Lottery" },
  { path: "/deploy", label: "Deploy" },
];

const DesktopNavLink = ({ path, label }: DesktopNavItemProps) => {
  const location = useLocation();
  const { setDirection } = useNavigationContext();
  const isActive = location.pathname === path;

  const handleClick = () => {
    const currentIndex = desktopNavItems.findIndex(
      (item) => item.path === location.pathname,
    );
    const newIndex = desktopNavItems.findIndex((item) => item.path === path);
    if (newIndex > currentIndex) {
      setDirection("right");
    } else {
      setDirection("left");
    }
  };

  return (
    <Link
      to={path}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
};

// --- Mobile Top Header ---
const MobileTopHeader = () => {
  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/helios-icon.png"
            alt="Helios Icon"
            className="h-8 w-8 rounded-full"
          />
          <span className="font-bold text-lg">
            Helivault <span className="text-primary">Gate</span>
          </span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Manage your wallet and preferences.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-6">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Theme</span>
                </div>
                <ThemeSwitcher />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Wallet</span>
                </div>
                <CustomConnectButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

/**
 * Main Navigation Component - Renders the correct layout for mobile vs desktop
 */
const Navigation = () => {
  const isMobile = useIsMobile();
  const { isConnected } = useAccount();

  if (isMobile) {
    return (
      <>
        <MobileTopHeader />
        <MobileBottomNav />
      </>
    );
  }

  return (
    <header className="sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 p-2 bg-card/80 backdrop-blur-lg rounded-2xl">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3 ml-2">
              <img
                src="/helios-icon.png"
                alt="Helios Icon"
                className="h-8 w-8 rounded-full"
              />
              <span className="hidden sm:block text-xl font-bold text-foreground whitespace-nowrap">
                Helivault <span className="text-primary">Gate</span>
              </span>
            </Link>
          </div>
          <nav className="flex items-center justify-center gap-1">
            {desktopNavItems.map((item) => (
              <DesktopNavLink key={item.path} {...item} />
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2 mr-2">
            <ThemeSwitcher />
            <div className="h-6 w-px bg-border" />
            {isConnected ? <ProfileDropdown /> : <CustomConnectButton />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
