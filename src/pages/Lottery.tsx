// src/pages/Lottery.tsx
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useBalance, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LOTTERY_CONTRACT } from "@/contracts/Lottery";
import { heliosTestnet } from "@/lib/chains";
import { formatEther, decodeEventLog } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Star, PartyPopper } from "lucide-react";

const Lottery = () => {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [showResult, setShowResult] = useState(false);
  const [winAmount, setWinAmount] = useState<bigint | null>(null);

  // --- Contract Reads ---
  const { data: entryPrice } = useReadContract({
    ...LOTTERY_CONTRACT,
    functionName: 'entryPrice',
  });

  const { data: contractBalance, refetch: refetchContractBalance } = useBalance({
    address: LOTTERY_CONTRACT.address as `0x${string}`,
    query: { enabled: isConnected },
  });

  const { data: lastWinner, refetch: refetchLastWinner } = useReadContract({
    ...LOTTERY_CONTRACT,
    functionName: 'lastWinner',
  });

  const { data: lastWinnerAmount, refetch: refetchLastWinnerAmount } = useReadContract({
    ...LOTTERY_CONTRACT,
    functionName: 'lastWinnerAmount',
  });

  // --- Transaction Confirmation ---
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
    onSuccess: (data) => {
      toast.success("Spin confirmed!");
      let amountWon: bigint | null = null;
      
      // Decode the event log to find the actual amount won
      for (const log of data.logs) {
        try {
          const decodedEvent = decodeEventLog({
            abi: LOTTERY_CONTRACT.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decodedEvent.eventName === "WinnerPaid") {
            amountWon = (decodedEvent.args as { winner: string; amount: bigint }).amount;
            break;
          }
        } catch (e) {
          // Ignore errors from logs that don't match the ABI
        }
      }

      setWinAmount(amountWon);
      setShowResult(true);
      refetchContractBalance();
      refetchLastWinner();
      refetchLastWinnerAmount();
    },
    onError: (error) => {
      toast.error("Spin failed to confirm", { description: error.message });
    },
  });

  // --- Contract Write ---
  const handleEnterLottery = async () => {
    if (!entryPrice) return;
    setShowResult(false);
    try {
      const txHash = await writeContractAsync({
        ...LOTTERY_CONTRACT,
        functionName: 'enter',
        value: entryPrice,
        account: address,
        chain: heliosTestnet,
      });
      setHash(txHash);
      toast.info("Spinning the wheel...");
    } catch (error: any) {
      toast.error("Failed to enter lottery", { description: error.shortMessage || "An error occurred." });
    }
  };

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2"><Ticket /> Helios Lottery</CardTitle>
          <CardDescription className="text-purple-200">Every spin is a win! Pay the price to win a random amount of HLS.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Entry Price</p>
              <p className="text-2xl font-bold">{entryPrice ? `${formatEther(entryPrice)} HLS` : "Loading..."}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Prize Pool</p>
              <p className="text-2xl font-bold">{contractBalance ? `${parseFloat(contractBalance.formatted).toFixed(4)} HLS` : "Loading..."}</p>
            </div>
          </div>
          
          {!isConnected ? (
            <ConnectButton label="Connect Wallet to Play" />
          ) : !isCorrectNetwork ? (
            <ConnectButton label="Wrong Network" />
          ) : (
            <Button onClick={handleEnterLottery} disabled={isConfirming} className="w-full text-lg py-6">
              {isConfirming ? "Spinning..." : "Spin the Wheel!"}
            </Button>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Result</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {winAmount && winAmount > 0n ? (
                  <>
                    <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
                    <p className="text-2xl font-bold">You Won!</p>
                    <p className="text-lg text-muted-foreground">You received {formatEther(winAmount)} HLS.</p>
                  </>
                ) : (
                  <>
                    <Star className="h-16 w-16 mx-auto text-yellow-500" />
                    <p className="text-2xl font-bold">No Prize This Time</p>
                    <p className="text-lg text-muted-foreground">The prize pool might be empty. Please ask the owner to fund it.</p>
                  </>
                )}
                <Button onClick={() => setShowResult(false)} variant="secondary">Play Again</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {lastWinner && lastWinner !== "0x0000000000000000000000000000000000000000" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Last Winner</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="truncate">{lastWinner}</p>
            <p>Won {lastWinnerAmount ? formatEther(lastWinnerAmount) : '0'} HLS</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default Lottery;
