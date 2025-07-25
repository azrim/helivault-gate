// src/components/MobileTopNav.tsx
import { Link, useLocation } from "react-router-dom";
import {
  LucideIcon,
  MoreHorizontal,
  Home,
  Sparkles,
  Droplets,
  LayoutGrid as Gallery,
  Rocket,
  Ticket,
  Copy,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useNavigationContext } from "@/context/NavigationContext";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { toast } from "sonner";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { useState, forwardRef } from "react";
import { useAppKit } from "@reown/appkit/react";

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

const NavLink = forwardRef<
  HTMLAnchorElement,
  NavItem & { isActive: boolean; onClick: () => void }
>(({ path, icon: Icon, label, isActive, onClick }, ref) => (
  <Link
    to={path}
    onClick={onClick}
    ref={ref}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    <Icon className="h-5 w-5" />
    <span className="text-base font-medium">{label}</span>
  </Link>
));
NavLink.displayName = "NavLink";

export const MobileTopNav = () => {
  const location = useLocation();
  const { setDirection } = useNavigationContext();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { open } = useAppKit();

  const { data: hlsBalance } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  const { data: hvtBalance } = useBalance({
    address,
    token: HELIVAULT_TOKEN_CONTRACT.address,
    query: { enabled: isConnected },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard!");
  };

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
    <>
      <header className="md:hidden sticky top-0 z-50 flex h-16 items-center justify-between bg-background/80 px-4 backdrop-blur-lg sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="/helios-icon.png" alt="Helios Icon" className="h-7 w-7" />
          <span className="hero-glow">
            Helivault <span className="text-blue-500">Gate</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <DropdownMenu onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <NavLink
                    {...item}
                    isActive={location.pathname === item.path}
                    onClick={() => handleClick(item.path)}
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {isConnected && address ? (
                <>
                  <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="flex justify-between items-center"
                    onSelect={() => copyToClipboard(address)}
                  >
                    <span>{`${address.slice(0, 10)}...${address.slice(
                      -8,
                    )}`}</span>
                    <Copy className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span>HLS Balance</span>
                      <strong>
                        {hlsBalance
                          ? parseFloat(hlsBalance.formatted).toFixed(4)
                          : "0.0000"}{" "}
                        {hlsBalance?.symbol}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span>HVT Balance</span>
                      <strong>
                        {hvtBalance
                          ? parseFloat(hvtBalance.formatted).toFixed(4)
                          : "0.0000"}{" "}
                        {hvtBalance?.symbol}
                      </strong>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => disconnect()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onSelect={() => open()}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Connect Wallet</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {isDropdownOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" />
      )}
    </>
  );
};

export default MobileTopNav;