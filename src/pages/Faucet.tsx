import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { heliosTestnet } from "@/lib/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Hourglass } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";

const Faucet = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: hash, isPending: isClaiming, writeContractAsync } = useWriteContract();

  const [cooldown, setCooldown] = useState(0);
  const [isClaimable, setIsClaimable] = useState(false);

  const { data: hlvBalance, refetch: refetchHlvBalance } = useReadContract({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  const { data: lastClaimed, refetch: refetchLastClaimed } = useReadContract({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: 'lastClaimed',
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  const { data: faucetAmountResult } = useReadContract({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: 'FAUCET_AMOUNT',
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const calculateCooldown = () => {
      if (typeof lastClaimed === 'bigint') {
        const now = Math.floor(Date.now() / 1000);
        const cooldownEnd = Number(lastClaimed) + (12 * 60 * 60);
        const remaining = cooldownEnd - now;
        if (remaining > 0) {
          setCooldown(remaining);
          setIsClaimable(false);
        } else {
          setCooldown(0);
          setIsClaimable(true);
        }
      }
    };

    calculateCooldown();
    const interval = setInterval(calculateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastClaimed]);

  const handleClaim = async () => {
    try {
      await writeContractAsync({
        ...HELIVAULT_TOKEN_CONTRACT,
        functionName: 'claim',
        account: address,
        chain: heliosTestnet,
      });
      toast.info("Claim transaction sent...");
    } catch (error: any) {
      toast.error("Claim failed", {
        description: error.shortMessage || "An error occurred.",
      });
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Successfully claimed HLV tokens!");
      refetchHlvBalance();
      refetchLastClaimed();
    }
  }, [isConfirmed, refetchHlvBalance, refetchLastClaimed]);

  const formatCooldown = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>HLV Faucet – Helivault Gate</title>
      </Helmet>
      <PageWrapper>
        <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Helivault Token Faucet</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Claim free HLV tokens to use for minting NFTs.
              </p>
              <div className="p-6 space-y-4">
                <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">Your HLV Balance</p>
                  <p className="text-4xl font-bold">
                    {typeof hlvBalance === 'bigint' ? Number(formatEther(hlvBalance)).toFixed(2) : "0.00"} HLV
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Claim Amount:</span>
                  <span className="font-bold">
                    {typeof faucetAmountResult === 'bigint' ? formatEther(faucetAmountResult) : '3.9'} HLV
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="text-muted-foreground">Cooldown:</span>
                  <span className="font-bold">12 Hours</span>
                </div>
              </div>

              <div className="mt-8 p-6 space-y-4">
                {!isConnected ? (
                  <div className="flex justify-center">
                    <ConnectButton label="Connect Wallet to Claim" />
                  </div>
                ) : !isCorrectNetwork ? (
                  <div className="flex justify-center">
                    <ConnectButton label="Wrong Network" />
                  </div>
                ) : isClaimable ? (
                  <Button onClick={handleClaim} disabled={isClaiming || isConfirming} className="w-full h-12 text-lg">
                    {isClaiming || isConfirming ? "Claiming..." : "Claim Tokens"}
                  </Button>
                ) : (
                  <Button disabled className="w-full h-12 text-lg">
                    <Hourglass className="w-5 h-5 mr-2" />
                    Claim in {formatCooldown(cooldown)}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </PageWrapper >
    </div>
  );
};

export default Faucet;