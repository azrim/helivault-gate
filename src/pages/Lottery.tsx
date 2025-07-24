// src/pages/Lottery.tsx
import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useBalance, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LOTTERY_CONTRACT } from "@/contracts/Lottery";
import { heliosTestnet } from "@/lib/chains";
import { formatEther, decodeEventLog, Abi } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Star, PartyPopper } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Lottery = () => {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [showResult, setShowResult] = useState(false);
  const [winAmount, setWinAmount] = useState<bigint | null>(null);

  const { data: entryPrice } = useReadContract({ ...LOTTERY_CONTRACT, functionName: "entryPrice" });
  const { data: contractBalance, refetch: refetchContractBalance } = useBalance({ address: LOTTERY_CONTRACT.address, query: { enabled: isConnected } });
  const { data: lastWinner, refetch: refetchLastWinner } = useReadContract({ ...LOTTERY_CONTRACT, functionName: "lastWinner" });
  const { data: lastWinnerAmount, refetch: refetchLastWinnerAmount } = useReadContract({ ...LOTTERY_CONTRACT, functionName: "lastWinnerAmount" });

  const refetchData = useCallback(() => {
    refetchContractBalance();
    refetchLastWinner();
    refetchLastWinnerAmount();
  }, [refetchContractBalance, refetchLastWinner, refetchLastWinnerAmount]);

  const { data: receipt, isSuccess: isConfirmed, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && receipt) {
      let amountWon: bigint | null = null;
      let winnerPaidEventFound = false;

      for (const log of receipt.logs) {
        try {
          const { eventName, args } = decodeEventLog({ abi: LOTTERY_CONTRACT.abi as Abi, data: log.data, topics: log.topics });
          if (eventName === "WinnerPaid") {
            winnerPaidEventFound = true;
            const winner = args[0] as `0x${string}`;
            const amount = args[1] as bigint;
            if (winner === address) {
              amountWon = amount;
            }
            break;
          }
        } catch (e) { /* Ignore non-matching logs */ }
      }

      // If no WinnerPaid event, it implies a consolation prize or no win.
      // We can't definitively know the amount without more events.
      // For a better UX, we'll check the lastWinner from the contract.
      refetchLastWinner().then(({ data: newLastWinner }) => {
        if (newLastWinner === address) {
          // If the user is the last winner, but we didn't find the event,
          // it's likely a small prize. We can show a generic win message.
          // For now, we'll rely on the event, but this is where you'd add
          // more robust logic if the contract doesn't always emit an event.
          if (!winnerPaidEventFound) {
            // Heuristic: Assume a win if the user is the last winner
            // but without a specific amount from an event.
            // This is not ideal. A better solution is to always emit an event.
            setWinAmount(1n); // Represents a generic "win"
          } else {
            setWinAmount(amountWon);
          }
        } else {
          setWinAmount(null); // Not the winner
        }
        setShowResult(true);
        toast.success("Spin confirmed!");
        refetchData();
      });
    }
  }, [isConfirmed, receipt, refetchData, address, refetchLastWinner]);

  const handleEnterLottery = async () => {
    if (typeof entryPrice !== "bigint") return;
    setShowResult(false);
    setWinAmount(null);
    try {
      const txHash = await writeContractAsync({ ...LOTTERY_CONTRACT, functionName: "enter", value: entryPrice, account: address });
      setHash(txHash);
      toast.info("Spinning the wheel...");
    } catch (error: any) {
      toast.error("Failed to enter lottery", { description: error.shortMessage || "An error occurred." });
    }
  };

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <>
      <Helmet><title>HLS Lottery – Helivault Gate</title></Helmet>
      <div className="space-y-16 pb-24">
        <section className="text-center pt-24 pb-12">
          <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            The <span className="text-primary">Helios Lottery</span>
          </motion.h1>
          <motion.p className="max-w-2xl mx-auto text-lg text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Test your luck and win HLS prizes. Every spin has a chance to win a jackpot!
          </motion.p>
        </section>

        <motion.section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid lg:grid-cols-2 gap-12">
            {/* --- Left Column --- */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><Ticket /> Spin the Wheel</CardTitle>
                  <CardDescription>Pay the entry price for a chance to win.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Entry Price</p>
                      <p className="text-2xl font-bold">{typeof entryPrice === "bigint" ? `${formatEther(entryPrice)} HLS` : "..."}</p>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Prize Pool</p>
                      <p className="text-2xl font-bold">{contractBalance ? `${parseFloat(contractBalance.formatted).toFixed(2)} HLS` : "..."}</p>
                    </div>
                  </div>
                  {!isConnected ? <ConnectButton label="Connect Wallet to Play" /> : !isCorrectNetwork ? <ConnectButton label="Wrong Network" /> : <Button onClick={handleEnterLottery} disabled={isConfirming} className="w-full h-12 text-lg">{isConfirming ? "Spinning..." : "Spin Now"}</Button>}
                </CardContent>
              </Card>
              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardHeader><CardTitle className="text-center">Result</CardTitle></CardHeader>
                      <CardContent className="text-center space-y-4">
                        {winAmount !== null && winAmount > 0n ? (
                          <>
                            <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
                            <p className="text-2xl font-bold">You Won!</p>
                            <p className="text-lg text-muted-foreground">You received {formatEther(winAmount)} HLS.</p>
                          </>
                        ) : (
                          <>
                            <Star className="h-16 w-16 mx-auto text-yellow-500" />
                            <p className="text-2xl font-bold">Better Luck Next Time</p>
                            <p className="text-lg text-muted-foreground">The prize pool might be empty or you hit a low-tier prize.</p>
                          </>
                        )}
                        <Button onClick={() => setShowResult(false)} variant="secondary">Play Again</Button>
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
                  <CardDescription>The prize you receive is a percentage of the total prize pool.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold text-yellow-400">🌟 Jackpot (1%)</span>
                    <span className="font-mono">50% of Prize Pool</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold text-slate-300">🥈 Gold (10%)</span>
                    <span className="font-mono">10% of Prize Pool</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold text-amber-700">🥉 Silver (25%)</span>
                    <span className="font-mono">2.5% of Prize Pool</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-bold">Consolation (~64%)</span>
                    <span className="font-mono">0.075 HLS</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Donate to the Prize Pool</CardTitle>
                  <CardDescription>
                    Help make the lottery more exciting by donating HLS to the prize pool.
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
              {lastWinner && lastWinner !== "0x0000000000000000000000000000000000000000" && (
                <Card>
                  <CardHeader><CardTitle className="text-center">Last Winner</CardTitle></CardHeader>
                  <CardContent className="text-center">
                    <p className="truncate font-mono text-sm">{lastWinner}</p>
                    <p>Won {typeof lastWinnerAmount === "bigint" ? formatEther(lastWinnerAmount) : "0"} HLS</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Lottery;
