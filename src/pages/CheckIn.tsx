// src/pages/CheckIn.tsx
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { DAILY_CHECK_IN_CONTRACT } from "@/contracts/DailyCheckIn";
import { heliosTestnet } from "@/lib/chains";

const CheckIn = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();

  const [canCheckIn, setCanCheckIn] = useState(false);

  const { data: streak, refetch: refetchStreak } = useReadContract({
    ...DAILY_CHECK_IN_CONTRACT,
    functionName: 'getStreak',
    args: [address!],
    query: { enabled: isConnected },
  });

  const { data: lastCheckIn, refetch: refetchLastCheckIn } = useReadContract({
    ...DAILY_CHECK_IN_CONTRACT,
    functionName: 'lastCheckIn',
    args: [address!],
    query: { enabled: isConnected },
  });
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (typeof lastCheckIn === 'bigint') {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastCheckInDay = new Date(Number(lastCheckIn) * 1000).setHours(0, 0, 0, 0);
      setCanCheckIn(today > lastCheckInDay);
    } else {
      setCanCheckIn(true);
    }
  }, [lastCheckIn]);

  const handleCheckIn = async () => {
    try {
      await writeContractAsync({
        ...DAILY_CHECK_IN_CONTRACT,
        functionName: 'checkIn',
        account: address,
        chain: heliosTestnet,
      });
      toast.info("Check-in transaction sent...");
    } catch (error: any) {
      toast.error("Check-in failed", {
        description: error.shortMessage || "An error occurred.",
      });
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Checked in successfully!");
      refetchStreak();
      refetchLastCheckIn();
    }
  }, [isConfirmed, refetchStreak, refetchLastCheckIn]);

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Daily Check-in</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Check in every day to maintain your streak!
          </p>
          <div className="bg-secondary/50 p-6 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground">Your Current Streak</p>
            <div className="flex items-center justify-center gap-2 text-6xl font-bold">
              <Flame className="h-12 w-12 text-orange-500" />
              <span>{streak?.toString() || 0}</span>
            </div>
          </div>
          <div className="mt-8">
            {!isConnected ? (
              <div className="flex justify-center">
                <ConnectButton label="Connect Wallet to Check-in" />
              </div>
            ) : !isCorrectNetwork ? (
               <div className="flex justify-center">
                  <ConnectButton label="Wrong Network" />
                </div>
            ) : (
              <Button
                onClick={handleCheckIn}
                disabled={!canCheckIn || isConfirming}
                className="w-full h-12 text-lg"
              >
                {isConfirming ? "Confirming..." : (canCheckIn ? "Check-in Now" : "Already Checked In Today")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default CheckIn;