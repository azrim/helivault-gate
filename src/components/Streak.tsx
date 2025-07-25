// src/components/Streak.tsx
import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { DAILY_CHECK_IN_CONTRACT } from "@/contracts/DailyCheckIn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Streak = () => {
  const { address, isConnected } = useAccount();
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

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (typeof lastCheckIn === "bigint") {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastCheckInDay = new Date(Number(lastCheckIn) * 1000).setHours(
        0,
        0,
        0,
        0,
      );
      setCanCheckIn(today > lastCheckInDay);
    } else if (isConnected) {
      setCanCheckIn(true);
    }
  }, [lastCheckIn, isConnected]);

  const handleCheckIn = async () => {
    try {
      const txHash = await writeContractAsync({
        ...DAILY_CHECK_IN_CONTRACT,
        functionName: "checkIn",
      });
      setHash(txHash);
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

  if (!isConnected) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>{streak?.toString() || 0}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Daily Check-in</h4>
            <p className="text-sm text-muted-foreground">
              Check in every day to maintain your streak!
            </p>
          </div>
          <Button
            onClick={handleCheckIn}
            disabled={!canCheckIn || isConfirming}
          >
            {isConfirming
              ? "Confirming..."
              : canCheckIn
                ? "Check-in Now"
                : "Already Checked In Today"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
