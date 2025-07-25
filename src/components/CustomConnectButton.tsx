// src/components/CustomConnectButton.tsx
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useBalance } from "wagmi";
import { Button } from "./ui/button";
import { Network } from "lucide-react";
import { heliosTestnet } from "@/lib/chains";

export const CustomConnectButton = () => {
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected || !address) {
    return (
      <Button onClick={() => open()} type="button">
        Connect Wallet
      </Button>
    );
  }

  if (chain?.id !== heliosTestnet.id) {
    return (
      <Button onClick={() => open()} type="button" variant="destructive">
        Wrong Network
      </Button>
    );
  }

  return (
    <div
      onClick={() => open({ view: "Account" })}
      className="flex items-center gap-3 cursor-pointer bg-secondary/70 hover:bg-secondary transition-colors px-3 py-2 rounded-full"
    >
      <Network className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium text-sm">
        {balance
          ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}`
          : "Loading..."}
      </span>
      <div className="h-4 w-px bg-border" />
      <span className="font-medium text-sm">
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>
    </div>
  );
};
