// src/pages/Faucet.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { heliosTestnet } from "@/lib/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Hourglass, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const Faucet = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();

  const [cooldown, setCooldown] = useState(0);

  const { data: hvtBalance, refetch: refetchHvtBalance } = useBalance({
    address: address,
    token: HELIVAULT_TOKEN_CONTRACT.address,
    query: { enabled: isConnected },
  });

  const { data: lastClaimed, refetch: refetchLastClaimed } = useReadContract({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: "lastFaucetUse",
    args: [address!],
    query: { enabled: isConnected },
  });

  const { data: faucetAmountResult } = useReadContract({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: "faucetAmount",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const calculateCooldown = () => {
      if (typeof lastClaimed === "bigint") {
        const now = Math.floor(Date.now() / 1000);
        const cooldownEnd = Number(lastClaimed) + 24 * 60 * 60;
        const remaining = cooldownEnd - now;
        setCooldown(remaining > 0 ? remaining : 0);
      }
    };
    calculateCooldown();
    const interval = setInterval(calculateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastClaimed]);

  const handleClaim = async () => {
    try {
      const txHash = await writeContractAsync({
        ...HELIVAULT_TOKEN_CONTRACT,
        functionName: "faucet",
      });
      setHash(txHash);
      toast.info("Claim transaction sent...");
    } catch (error: any) {
      toast.error("Claim failed", { description: error.shortMessage || "An error occurred." });
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Successfully claimed HVT tokens!");
      refetchHvtBalance();
      refetchLastClaimed();
    }
  }, [isConfirmed, refetchHvtBalance, refetchLastClaimed]);

  const formatCooldown = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const isClaimable = cooldown <= 0;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <>
      <Helmet>
        <title>HVT Faucet – Helivault Gate</title>
      </Helmet>
      <div className="space-y-16 pb-24">
        {/* Header */}
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            HVT Token <span className="text-primary">Faucet</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Get free Helivault Tokens (HVT) to use for minting NFTs and interacting with our ecosystem.
          </motion.p>
        </section>

        {/* Faucet Section */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Droplets className="h-6 w-6 text-primary" />
                <span>Claim Your Tokens</span>
              </CardTitle>
              <CardDescription>
                You can claim {typeof faucetAmountResult === "bigint" ? formatEther(faucetAmountResult) : "0.1"} HVT every 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              <div className="bg-secondary p-6 rounded-lg">
                <p className="text-sm text-muted-foreground">Your HVT Balance</p>
                <p className="text-4xl font-bold">
                  {hvtBalance ? `${parseFloat(hvtBalance.formatted).toFixed(2)} HVT` : "0.00 HVT"}
                </p>
              </div>

              {!isConnected ? (
                <ConnectButton label="Connect Wallet to Claim" />
              ) : !isCorrectNetwork ? (
                <ConnectButton label="Wrong Network" />
              ) : isClaimable ? (
                <Button onClick={handleClaim} disabled={isConfirming} className="w-full h-12 text-lg">
                  {isConfirming ? "Claiming..." : "Claim Tokens"}
                </Button>
              ) : (
                <Button disabled className="w-full h-12 text-lg">
                  <Hourglass className="w-5 h-5 mr-2" />
                  Claim in {formatCooldown(cooldown)}
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default Faucet;
