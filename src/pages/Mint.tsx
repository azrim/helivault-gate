// src/pages/Mint.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { QUANTUM_RELICS_CONTRACT } from "@/contracts/QuantumRelics";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { heliosTestnet } from "@/lib/chains";
import { formatEther, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Mint = () => {
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();
  const { data: hash, isPending: isMinting, writeContractAsync } = useWriteContract();
  
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const toastShownRef = useRef(false);

  const nftContract = QUANTUM_RELICS_CONTRACT;
  const tokenContract = HELIVAULT_TOKEN_CONTRACT;

  const { data: totalSupply } = useReadContract({ ...nftContract, functionName: 'currentSupply' });
  const { data: maxSupply } = useReadContract({ ...nftContract, functionName: 'MAX_SUPPLY' });
  const { data: mintPrice } = useReadContract({ ...nftContract, functionName: 'MINT_PRICE' });
  const { data: userBalance } = useReadContract({ ...nftContract, functionName: 'balanceOf', args: [address!], query: { enabled: isConnected && !!address } });
  
  const { data: allowance } = useReadContract({
    ...tokenContract,
    functionName: 'allowance',
    args: [address!, nftContract.address],
    query: { enabled: isConnected && !!address, refetchInterval: 5000 },
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleMint = async () => {
    toastShownRef.current = false;
    if (typeof mintPrice === 'undefined' || quantity <= 0) {
      toast.error("Invalid quantity or price not loaded.");
      return;
    }
    const totalCost = mintPrice * BigInt(quantity);

    try {
      if (typeof allowance === 'undefined' || allowance < totalCost) {
        toast.info("Approving HLV token spend...");
        await writeContractAsync({
          ...tokenContract,
          functionName: 'approve',
          args: [nftContract.address, totalCost],
          account: address, // Added account
          chain: heliosTestnet, // Added chain
        });
        toast.success("Approval successful! Please click Mint Now again.");
        queryClient.invalidateQueries({ queryKey: [['allowance']] });
        return; // Return to allow user to click mint again
      }
      
      toast.info("Sending mint transaction...");
      await writeContractAsync({
        ...nftContract,
        functionName: 'mint',
        args: [BigInt(quantity)],
        account: address,
        chain: heliosTestnet,
      });
    } catch (error: any) {
      toast.error("Transaction failed", {
        description: error.shortMessage || "The transaction was cancelled or failed.",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (isConfirmed && !toastShownRef.current) {
      toast.success(`🎉 ${quantity} Quantum Relic(s) Minted Successfully!`, {
        description: (
          <a href={`${heliosTestnet.blockExplorers.default.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">View on Explorer ↗</a>
        ),
        duration: 8000,
      });
      queryClient.invalidateQueries();
      toastShownRef.current = true;
    }
  }, [isConfirmed, hash, queryClient, quantity]);

  useEffect(() => { if (hash) { toastShownRef.current = false; } }, [hash]);

  const currentSupplyNum = typeof totalSupply === 'bigint' ? Number(totalSupply) : 0;
  const maxSupplyNum = typeof maxSupply === 'bigint' ? Number(maxSupply) : 3999;
  const mintPriceHLV = typeof mintPrice === 'bigint' ? formatEther(mintPrice) : "0.39";
  const userBalanceNum = typeof userBalance === 'bigint' ? Number(userBalance) : 0;
  const isSoldOut = currentSupplyNum >= maxSupplyNum;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const isLoading = isMinting || isConfirming;

  const copyToClipboard = (text: string) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nftImageUrl = `https://bafybeicv24cjsqbiqwiui7txa5rk4yzrx43vaw4wheip4qp6fahpcsuhh4.ipfs.w3s.link/relic.png`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mint – Quantum Relics</title>
      </Helmet>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="w-full aspect-square lg:sticky lg:top-28">
            <img 
              src={nftImageUrl} 
              alt="Quantum Relic" 
              className="object-cover w-full h-full rounded-xl shadow-lg top-0 transition-transform transform hover:scale-105 hover:shadow-xl"
            />
          </div>

          <div className="w-full flex flex-col gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Quantum Relics</h1>
              <p className="text-muted-foreground">
                Part of the Helivault NFT Collection
              </p>
            </div>
            
            <Card className="border-primary/50 border-2 bg-card">
              <CardContent className="p-6 flex flex-col gap-4">
                <p className="text-4xl font-bold">
                  {mintPriceHLV} HLV
                </p>

                {isConnected && (
                  <div className="text-sm text-muted-foreground">
                    <span>{currentSupplyNum.toLocaleString()} / {maxSupplyNum.toLocaleString()} minted</span>
                    <span className="mx-2">•</span>
                    <span>{userBalanceNum} minted by you</span>
                  </div>
                )}
                
                <div className="flex gap-4 items-center pt-2">
                  <Input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 h-12 text-center text-lg"
                    disabled={isLoading}
                  />
                  <div className="flex-1 w-full">
                    {isConnected ? (
                      <Button onClick={handleMint} disabled={isLoading || isSoldOut || !isCorrectNetwork} className="w-full h-12 text-lg">
                        {isLoading ? "Processing..." : isSoldOut ? "Sold Out" : !isCorrectNetwork ? "Wrong Network" : `Mint Now`}
                      </Button>
                    ) : (
                      <div className="flex justify-center h-12"><ConnectButton label="Connect Wallet to Mint"/></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NFT Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contract Address</span>
                  <a href={`${heliosTestnet.blockExplorers.default.url}/address/${nftContract.address}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary hover:underline flex items-center gap-2">
                    {`${nftContract.address.slice(0, 6)}...${nftContract.address.slice(-4)}`}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); copyToClipboard(nftContract.address); }}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Token Standard</span>
                  <span className="font-mono">ERC-721</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="font-mono text-right">{chain?.name || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mint;