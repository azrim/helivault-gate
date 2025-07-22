// src/components/WalletStatus.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { heliosTestnet } from "@/lib/chains";

const WalletStatus = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  if (!isConnected) {
    return (
      <Card className="bg-warning/5 border-warning/20">
        <CardContent className="p-6 pt-6 text-center">
          <Wallet className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to start minting NFTs and track your collection.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${isCorrectNetwork ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}`}
    >
      <CardContent className="p-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${isCorrectNetwork ? "text-success" : "text-warning"}`}
          >
            {isCorrectNetwork ? "Wallet Connected" : "Wrong Network"}
          </h3>
          <div
            className={`w-3 h-3 rounded-full ${isCorrectNetwork ? "bg-success" : "bg-warning"}`}
          ></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Address</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() =>
                  window.open(
                    `${heliosTestnet.blockExplorers.default.url}/address/${address}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-medium">
              {balance
                ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                : "0.00 HLS"}
            </span>
          </div>
          {!isCorrectNetwork && (
            <div className="mt-4">
              <ConnectButton />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletStatus;
