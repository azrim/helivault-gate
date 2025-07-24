import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CustomConnectButton } from "./CustomConnectButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTopNav } from "./MobileTopNav";
import { useNavigationContext } from "@/context/NavigationContext";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAccount } from "wagmi";
import { Streak } from "./Streak";

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

/**
 * Main Navigation Component - Renders the correct layout for mobile vs desktop
 */
const Navigation = () => {
  const isMobile = useIsMobile();
  const { isConnected } = useAccount();

  console.log("isMobile:", isMobile);

  if (isMobile) {
    return <MobileTopNav />;
  }

  return (
    <header className="sticky top-4 z-50">
      <div className="mx-auto px-8">
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
            <Streak />
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
