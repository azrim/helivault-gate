// src/pages/Lottery.tsx
import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBalance,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { LOTTERY_CONTRACT } from "@/contracts/Lottery";
import { heliosTestnet } from "@/lib/chains";
import { formatEther, decodeEventLog, Abi } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Star, PartyPopper } from "lucide-react";
import Page from "@/components/Page";

const Lottery = () => {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [showResult, setShowResult] = useState(false);
  const [winAmount, setWinAmount] = useState<bigint | null>(null);

  const { data: entryPrice } = useReadContract({
    ...LOTTERY_CONTRACT,
    functionName: "entryPrice",
  });
  const { data: contractBalance, refetch: refetchContractBalance } = useBalance(
    { address: LOTTERY_CONTRACT.address, query: { enabled: isConnected } },
  );
  const { data: lastWinner, refetch: refetchLastWinner } = useReadContract({
    ...LOTTERY_CONTRACT,
    functionName: "lastWinner",
  });
  const { data: lastWinnerAmount, refetch: refetchLastWinnerAmount } =
    useReadContract({ ...LOTTERY_CONTRACT, functionName: "lastWinnerAmount" });

  const refetchData = useCallback(() => {
    refetchContractBalance();
    refetchLastWinner();
    refetchLastWinnerAmount();
  }, [refetchContractBalance, refetchLastWinner, refetchLastWinnerAmount]);

  const {
    data: receipt,
    isSuccess: isConfirmed,
    isLoading: isConfirming,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && receipt) {
      let amountWon: bigint | null = null;
      for (const log of receipt.logs) {
        try {
          const { eventName, args } = decodeEventLog({
            abi: LOTTERY_CONTRACT.abi as Abi,
            data: log.data,
            topics: log.topics,
          });
          if (eventName === "WinnerPaid") {
            const { winner, amount } = args as unknown as {
              winner: `0x${string}`;
              amount: bigint;
            };
            if (winner.toLowerCase() === address?.toLowerCase()) {
              amountWon = amount;
            }
            break; // Exit loop once the event is found
          }
        } catch (e) {
          /* Ignore non-matching logs */
        }
      }
      setWinAmount(amountWon);
      setShowResult(true);
      toast.success("Spin confirmed!");
      refetchData();
    }
  }, [isConfirmed, receipt, refetchData, address]);

  const handleEnterLottery = async () => {
    if (typeof entryPrice !== "bigint") return;
    setShowResult(false);
    setWinAmount(null);
    try {
      const txHash = await writeContractAsync({
        ...LOTTERY_CONTRACT,
        functionName: "enter",
        value: entryPrice,
        account: address,
      });
      setHash(txHash);
      toast.info("Spinning the wheel...");
    } catch (error: any) {
      toast.error("Failed to enter lottery", {
        description: error.shortMessage || "An error occurred.",
      });
    }
  };

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <Page
      title="HLS Lottery"
      description="Test your luck and win HLS prizes. Every spin has a chance to win a jackpot!"
    >
      <div className="space-y-16 pb-24">
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            The <span className="text-primary">Helios Lottery</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Test your luck and win HLS prizes. Every spin has a chance to win a
            jackpot!
          </motion.p>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* --- Left Column --- */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Ticket /> Spin the Wheel
                  </CardTitle>
                  <CardDescription>
                    Pay the entry price for a chance to win.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Entry Price
                      </p>
                      <p className="text-2xl font-bold">
                        {typeof entryPrice === "bigint"
                          ? `${formatEther(entryPrice)} HLS`
                          : "..."}
                      </p>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Prize Pool
                      </p>
                      <p className="text-2xl font-bold">
                        {contractBalance
                          ? `${parseFloat(contractBalance.formatted).toFixed(2)} HLS`
                          : "..."}
                      </p>
                    </div>
                  </div>
                  {!isConnected ? (
                    <Button
                      onClick={() => {
                        /* This will be handled by the ConnectWallet button in the nav */
                      }}
                      className="w-full h-12 text-lg"
                    >
                      Connect Wallet to Play
                    </Button>
                  ) : !isCorrectNetwork ? (
                    <Button disabled className="w-full h-12 text-lg">
                      Wrong Network
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnterLottery}
                      disabled={isConfirming}
                      className="w-full h-12 text-lg"
                    >
                      {isConfirming ? "Spinning..." : "Spin Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center">Result</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        {winAmount !== null && winAmount > 0n ? (
                          <>
                            <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
                            <p className="text-2xl font-bold">You Won!</p>
                            <p className="text-lg text-muted-foreground">
                              You received {formatEther(winAmount)} HLS.
                            </p>
                          </>
                        ) : (
                          <>
                            <Star className="h-16 w-16 mx-auto text-yellow-500" />
                            <p className="text-2xl font-bold">
                              Better Luck Next Time
                            </p>
                            <p className="text-lg text-muted-foreground">
                              The prize pool might be empty or you hit a
                              low-tier prize.
                            </p>
                          </>
                        )}
                        <Button
                          onClick={() => setShowResult(false)}
                          variant="secondary"
                        >
                          Play Again
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- Right Column --- */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Prize Tiers</CardTitle>
                  <CardDescription>
                    The prize you receive is a percentage of the total prize
                    pool.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold text-yellow-400">
                      🌟 Jackpot (1%)
                    </span>
                    <span className="font-mono">50% of Prize Pool</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold text-slate-300">
                      🥈 Gold (5%)
                    </span>
                    <span className="font-mono">10% of Prize Pool</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold text-amber-700">
                      🥉 Silver (15%)
                    </span>
                    <span className="font-mono">2.5% of Prize Pool</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold">Consolation (79%)</span>
                    <span className="font-mono">0.075 HLS</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Donate to the Prize Pool</CardTitle>
                  <CardDescription>
                    Help make the lottery more exciting by donating HLS to the
                    prize pool.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    To donate, simply send HLS to the lottery contract address:
                  </p>
                  <p className="font-mono text-sm bg-secondary p-2 rounded-lg mt-2 truncate">
                    {LOTTERY_CONTRACT.address}
                  </p>
                </CardContent>
              </Card>
              {lastWinner &&
                lastWinner !== "0x0000000000000000000000000000000000000000" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Last Winner</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="truncate font-mono text-sm">{lastWinner}</p>
                      <p>
                        Won{" "}
                        {typeof lastWinnerAmount === "bigint"
                          ? formatEther(lastWinnerAmount)
                          : "0"}{" "}
                        HLS
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>
        </motion.section>
      </div>
    </Page>
  );
};

export default Lottery;
