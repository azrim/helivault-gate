import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Sparkles,
  Droplets,
  LayoutGrid as Gallery,
  Rocket,
  Ticket,
  Menu,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import WalletStatus from "./WalletStatus";
import { useNavigationContext } from "@/context/NavigationContext";
import React from "react";
import { useAccount } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/mint", label: "Mint", icon: Sparkles },
  { path: "/gallery", label: "Gallery", icon: Gallery },
  { path: "/faucet", label: "Faucet", icon: Droplets },
  { path: "/lottery", label: "Lottery", icon: Ticket },
  { path: "/deploy", label: "Deploy", icon: Rocket },
];

const MobileNavLink = ({
  path,
  icon: Icon,
  label,
  isActive,
  onClick,
}: NavItem & { isActive: boolean; onClick: () => void }) => (
  <SheetClose asChild>
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  </SheetClose>
);

const ProfileHeader = () => {
  const { address } = useAccount();
  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`https://effigy.im/a/${address}.png`} />
          <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-lg">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <p className="text-sm text-muted-foreground">Helivault User</p>
        </div>
      </div>
    </div>
  );
};

export const MobileTopNav = () => {
  const location = useLocation();
  const { setDirection } = useNavigationContext();
  const { isConnected } = useAccount();

  const handleClick = (newPath: string) => {
    const currentIndex = navItems.findIndex(
      (item) => item.path === location.pathname,
    );
    const newIndex = navItems.findIndex((item) => item.path === newPath);
    if (newIndex > currentIndex) {
      setDirection("right");
    } else if (newIndex < currentIndex) {
      setDirection("left");
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <img src="/helios-icon.png" alt="Helios Icon" className="h-7 w-7" />
        <span className="hero-glow">Helivault</span>
      </Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm p-0">
          <div className="flex h-full flex-col">
            {isConnected && (
              <>
                <ProfileHeader />
                <Separator />
              </>
            )}
            <nav className="grid gap-2 p-4">
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.path}
                  {...item}
                  isActive={location.pathname === item.path}
                  onClick={() => handleClick(item.path)}
                />
              ))}
            </nav>
            <div className="mt-auto p-4 space-y-4 border-t">
              <WalletStatus />
              <ThemeSwitcher />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
