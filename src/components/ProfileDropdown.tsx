// src/components/ProfileDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { formatEther } from "viem";
import { Copy, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";

export const ProfileDropdown = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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

  if (!isConnected || !address) {
    // This component will only render when connected,
    // so this is just a fallback.
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuItem
          className="flex justify-between items-center"
          onSelect={() => copyToClipboard(address)}
        >
          <span>{`${address.slice(0, 10)}...${address.slice(-8)}`}</span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
