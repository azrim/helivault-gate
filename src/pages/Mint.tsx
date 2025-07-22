// src/pages/Mint.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, Coins, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConfig,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { HELIVAULT_COLLECTIONS_CONTRACT } from "@/contracts/HelivaultCollections";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { heliosTestnet } from "@/lib/chains";
import { formatEther, TransactionExecutionError } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

const contractConfig = HELIVAULT_COLLECTIONS_CONTRACT;
const tokenContract = HELIVAULT_TOKEN_CONTRACT;

const Mint = () => {
  const wagmiConfig = useConfig();
  const { address, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [mintingStep, setMintingStep] = useState<"idle" | "approving" | "minting">("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const isConnected = !!address;

  // --- Data Fetching ---
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    ...contractConfig,
    functionName: "totalSupply",
  });
  const { data: maxSupply } = useReadContract({
    ...contractConfig,
    functionName: "maxSupply",
  });
  const { data: mintPriceResult } = useReadContract({
    ...contractConfig,
    functionName: "mintPrice",
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...tokenContract,
    functionName: "allowance",
    args: [address!, contractConfig.address],
    query: { enabled: isConnected },
  });

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // --- Main Minting Logic ---
  const handleMint = async () => {
    if (!address || !chain || typeof mintPriceResult === "undefined" || quantity <= 0) return;
    const totalCost = (mintPriceResult as bigint) * BigInt(quantity);

    const toastId = toast.loading("Initializing transaction...");

    try {
      if (typeof allowance !== "bigint" || allowance < totalCost) {
        setMintingStep("approving");
        toast.loading("Approval required...", { id: toastId });
        const approvalHash = await writeContractAsync({
          ...tokenContract,
          functionName: "approve",
          args: [contractConfig.address, totalCost],
        });
        await waitForTransactionReceipt(wagmiConfig, { hash: approvalHash });
        toast.success("Approval successful!", { id: toastId });
        await refetchAllowance();
      }

      setMintingStep("minting");
      toast.loading("Minting your NFT...", { id: toastId });
      const mintTxHash = await writeContractAsync({
        ...contractConfig,
        functionName: "mint",
        args: [BigInt(quantity)],
      });
      setTxHash(mintTxHash);
    } catch (error: unknown) {
      const errorMessage = error instanceof TransactionExecutionError ? error.shortMessage : "Transaction failed.";
      toast.error("Minting Failed", { id: toastId, description: errorMessage });
      setMintingStep("idle");
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast.success(`🎉 ${quantity} NFT(s) Minted Successfully!`);
      refetchTotalSupply();
      setMintingStep("idle");
      setTxHash(undefined);
    }
  }, [isConfirmed, quantity, refetchTotalSupply]);

  // --- UI State ---
  const currentSupply = typeof totalSupply === "bigint" ? Number(totalSupply) : 0;
  const maxSupplyNum = typeof maxSupply === "bigint" ? Number(maxSupply) : 10000;
  const mintPriceHVT = typeof mintPriceResult === "bigint" ? formatEther(mintPriceResult) : "0";
  const isSoldOut = currentSupply >= maxSupplyNum;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const isLoading = mintingStep !== "idle";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Mint NFT – Helivault Gate</title>
      </Helmet>
      <div className="space-y-16 pb-24">
        {/* Header */}
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Mint Your <span className="text-primary">Digital Relic</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Become a part of the Helivault ecosystem by minting a unique NFT on the Helios blockchain.
          </motion.p>
        </section>

        {/* Minting Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="aspect-square rounded-2xl bg-card p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <img
                src="https://bafybeicv24cjsqbiqwiui7txa5rk4yzrx43vaw4wheip4qp6fahpcsuhh4.ipfs.w3s.link/relic.png"
                alt="NFT to be minted"
                className="object-cover w-full h-full rounded-xl"
              />
            </motion.div>
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Mint Your NFT</CardTitle>
                  <CardDescription>
                    {currentSupply} / {maxSupplyNum} minted
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-4xl font-bold">{mintPriceHVT} HVT</div>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 h-12 text-center text-lg"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      {!isConnected ? (
                        <ConnectButton label="Connect Wallet to Mint" />
                      ) : !isCorrectNetwork ? (
                        <ConnectButton label="Wrong Network" />
                      ) : (
                        <Button
                          onClick={handleMint}
                          disabled={isLoading || isSoldOut}
                          className="w-full h-12 text-lg"
                        >
                          {isLoading ? `${mintingStep}...` : isSoldOut ? "Sold Out" : "Mint Now"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <div className="flex items-center gap-2 font-mono">
                      <a href={`${heliosTestnet.blockExplorers.default.url}/address/${contractConfig.address}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {`${contractConfig.address.slice(0, 6)}...${contractConfig.address.slice(-4)}`}
                      </a>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(contractConfig.address)}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Standard</span>
                    <span className="font-mono">ERC-721</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Mint;
