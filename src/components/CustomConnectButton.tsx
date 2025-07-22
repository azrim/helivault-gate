// src/components/CustomConnectButton.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance } from "wagmi";
import { Button } from "./ui/button";
import { Network } from "lucide-react";

export const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <Button onClick={openConnectModal} type="button">
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} type="button" variant="destructive">
              Wrong Network
            </Button>
          );
        }

        return (
          <div
            onClick={openAccountModal}
            className="flex items-center gap-3 cursor-pointer bg-secondary/70 hover:bg-secondary transition-colors px-3 py-2 rounded-full"
          >
            <Network className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-sm">
              {account.balanceFormatted
                ? `${parseFloat(account.balanceFormatted).toFixed(3)} ${account.balanceSymbol}`
                : "Loading..."}
            </span>
            <div className="h-4 w-px bg-border" />
            <span className="font-medium text-sm">{account.displayName}</span>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
