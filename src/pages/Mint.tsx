import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Minus, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { HELIVAULT_CYPHERS_CONTRACT } from "@/contracts/HelivaultNFT";
import { heliosTestnet } from "@/lib/chains";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Mint = () => {
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();
  const { data: hash, isPending: isMinting, writeContractAsync } = useWriteContract();

  const [quantity, setQuantity] = useState(1);
  const toastShownRef = useRef(false);

  const contract = HELIVAULT_CYPHERS_CONTRACT; 

  const { data: totalSupply } = useReadContract({
    ...contract,
    functionName: 'totalSupply',
  });

  const { data: maxSupply } = useReadContract({
    ...contract,
    functionName: 'maxSupply',
  });

  const { data: mintPrice } = useReadContract({
    ...contract,
    functionName: 'mintPrice',
  });

  const { data: userBalance } = useReadContract({
    ...contract,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleMint = async () => {
    toastShownRef.current = false;
    if (!mintPrice || quantity <= 0) {
      toast.error("Invalid quantity or price not loaded.");
      return;
    }
    
    const totalValue = mintPrice * BigInt(quantity);

    try {
      await writeContractAsync({
        ...contract,
        functionName: 'mint',
        args: [BigInt(quantity)],
        value: totalValue,
        account: address,
        chain: heliosTestnet,
      });
    } catch (error: any) {
      toast.error("Minting failed", {
        description: error.shortMessage || "The transaction was cancelled or failed.",
        duration: 5000,
      });
    }
  };
  
  useEffect(() => {
    if (isConfirmed && !toastShownRef.current) {
      toast.success(`🎉 ${quantity} NFT(s) Minted Successfully!`, {
        description: (
          <a href={`${heliosTestnet.blockExplorers.default.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">
            View on Explorer ↗
          </a>
        ),
        duration: 8000,
      });
      queryClient.invalidateQueries();
      toastShownRef.current = true;
    }
  }, [isConfirmed, hash, queryClient, quantity]);

  useEffect(() => {
    if (hash) {
      toastShownRef.current = false;
    }
  }, [hash]);

  const currentSupplyNum = typeof totalSupply !== 'undefined' ? Number(totalSupply) : 0;
  const maxSupplyNum = typeof maxSupply !== 'undefined' ? Number(maxSupply) : 756;
  const mintPriceHLS = typeof mintPrice !== 'undefined' ? formatEther(mintPrice) : "0.0756";
  const userBalanceNum = typeof userBalance !== 'undefined' ? Number(userBalance) : 0;
  const isSoldOut = currentSupplyNum >= maxSupplyNum;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const isLoading = isMinting || isConfirming;
  
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  const nftImageUrl = `https://united-black-sparrow.myfilebase.com/ipfs/QmTRXwFP1AwyiUasNQUxPUi3pwjJdXgoAzGozrA1LAUd2m`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mint – Helivault Cyphers</title>
      </Helmet>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch justify-center">
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="aspect-square w-full max-w-sm rounded-xl overflow-hidden relative">
                  <img 
                    src={nftImageUrl} 
                    alt="Helivault Cypher" 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/vault-placeholder.png";
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center w-full lg:w-1/2 space-y-6">
                <div className="w-full max-w-xl space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Helivault Cyphers</h1>
                    <div className="text-sm text-muted-foreground mb-4 text-justify">
                      From the silent, encrypted core of the Helivault—a dormant server of a long-lost digital civilization—756 Cyphers have awakened. These are not mere artifacts; they are sentient fragments of a grand, universal code, each one holding a unique resonance and a piece of a forgotten cosmic blueprint. It is whispered that when the Cyphers are brought together, they can unlock dormant protocols within the Helios network, revealing pathways to new dimensions of creation. To possess a Cypher is to become a guardian of this lost data, a keeper of a key that could either rebuild a digital Eden or unleash chaos into the system.
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-lg font-bold">{mintPriceHLS} HLS</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Supply</span>
                      <span className="font-medium">{`${currentSupplyNum} / ${maxSupplyNum}`}</span>
                    </div>
                    {isConnected && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Your NFTs</span>
                        <span className="font-medium text-success">{userBalanceNum}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input type="number" readOnly value={quantity} className="text-center w-20" />
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isConnected ? (
                     <Button onClick={handleMint} disabled={isLoading || isSoldOut || !isCorrectNetwork} className="w-full h-12 text-lg">
                      {isLoading ? "Minting..." : isSoldOut ? "Sold Out" : !isCorrectNetwork ? "Wrong Network" : `Mint ${quantity} NFT(s)`}
                    </Button>
                  ) : (
                    <div className="flex justify-center"><ConnectButton label="Connect Wallet to Mint"/></div>
                  )}
                  
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Mint;