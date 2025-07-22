// src/pages/CheckIn.tsx
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { DAILY_CHECK_IN_CONTRACT } from "@/contracts/DailyCheckIn";
import { heliosTestnet } from "@/lib/chains";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const CheckIn = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();

  const [canCheckIn, setCanCheckIn] = useState(false);

  const { data: streak, refetch: refetchStreak } = useReadContract({
    ...DAILY_CHECK_IN_CONTRACT,
    functionName: "getStreak",
    args: [address!],
    query: { enabled: isConnected },
  });

  const { data: lastCheckIn, refetch: refetchLastCheckIn } = useReadContract({
    ...DAILY_CHECK_IN_CONTRACT,
    functionName: "lastCheckIn",
    args: [address!],
    query: { enabled: isConnected },
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (typeof lastCheckIn === "bigint") {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastCheckInDay = new Date(Number(lastCheckIn) * 1000).setHours(0, 0, 0, 0);
      setCanCheckIn(today > lastCheckInDay);
    } else if (isConnected) {
      setCanCheckIn(true);
    }
  }, [lastCheckIn, isConnected]);

  const handleCheckIn = async () => {
    try {
      const txHash = await writeContractAsync({ ...DAILY_CHECK_IN_CONTRACT, functionName: "checkIn" });
      setHash(txHash);
      toast.info("Check-in transaction sent...");
    } catch (error: any) {
      toast.error("Check-in failed", { description: error.shortMessage || "An error occurred." });
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
  const streakNumber = streak?.toString() || "0";

  return (
    <>
      <Helmet>
        <title>Daily Check-in – Helivault Gate</title>
      </Helmet>
      <div className="space-y-16 pb-24">
        {/* Header */}
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Daily <span className="text-primary">Check-in</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Check in every day to build your streak and demonstrate your commitment.
          </motion.p>
        </section>

        {/* Check-in Section */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Streak</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              <div className="flex items-center justify-center gap-4 text-8xl font-bold text-orange-500">
                <Flame className="h-20 w-20" />
                <span>{streakNumber}</span>
              </div>
              <p className="text-muted-foreground">
                {streakNumber === "0" ? "Start your streak today!" : `You've checked in ${streakNumber} day(s) in a row!`}
              </p>
              
              <div className="pt-4">
                {!isConnected ? (
                  <ConnectButton label="Connect Wallet to Check-in" />
                ) : !isCorrectNetwork ? (
                  <ConnectButton label="Wrong Network" />
                ) : (
                  <Button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || isConfirming}
                    className="w-full h-12 text-lg"
                  >
                    {isConfirming ? "Confirming..." : canCheckIn ? "Check-in Now" : "Already Checked In Today"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default CheckIn;
