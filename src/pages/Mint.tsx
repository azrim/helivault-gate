import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Minus, Plus, Copy, Check } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

const Mint = () => {
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();
  const { data: hash, isPending: isMinting, writeContractAsync } = useWriteContract();

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const toastShownRef = useRef(false);

  const contract = HELIVAULT_CYPHERS_CONTRACT;

  // --- Fetch all contract data ---
  const { data: totalSupply } = useReadContract({ ...contract, functionName: 'totalSupply' });
  const { data: maxSupply } = useReadContract({ ...contract, functionName: 'maxSupply' });
  const { data: mintPrice } = useReadContract({ ...contract, functionName: 'mintPrice' });
  const { data: userBalance } = useReadContract({ ...contract, functionName: 'balanceOf', args: [address!], query: { enabled: isConnected && !!address } });
  const { data: contractOwner } = useReadContract({ ...contract, functionName: 'owner' });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

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
          <a href={`${heliosTestnet.blockExplorers.default.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">View on Explorer ↗</a>
        ),
        duration: 8000,
      });
      queryClient.invalidateQueries();
      toastShownRef.current = true;
    }
  }, [isConfirmed, hash, queryClient, quantity]);

  useEffect(() => { if (hash) { toastShownRef.current = false; } }, [hash]);

  const currentSupplyNum = typeof totalSupply !== 'undefined' ? Number(totalSupply) : 0;
  const maxSupplyNum = typeof maxSupply !== 'undefined' ? Number(maxSupply) : 756;
  const mintPriceHLS = typeof mintPrice !== 'undefined' ? formatEther(mintPrice) : "0.0756";
  const userBalanceNum = typeof userBalance !== 'undefined' ? Number(userBalance) : 0;
  const isSoldOut = currentSupplyNum >= maxSupplyNum;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const isLoading = isMinting || isConfirming;
  const totalPrice = mintPrice ? (Number(formatEther(mintPrice)) * quantity).toFixed(4) : "0.00";

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nftImageUrl = `https://united-black-sparrow.myfilebase.com/ipfs/QmTRXwFP1AwyiUasNQUxPUi3pwjJdXgoAzGozrA1LAUd2m`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mint – Helivault Cyphers</title>
      </Helmet>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* --- NEW TWO-COLUMN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Image */}
          <div className="w-full aspect-square sticky top-28">
            <img 
              src={nftImageUrl} 
              alt="Helivault Cypher" 
              className="object-cover w-full h-full rounded-xl shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = "/vault-placeholder.png"; }}
            />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="w-full flex flex-col gap-8">
            {/* Header Info */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Helivault Cyphers</h1>
              <p className="text-muted-foreground">
                Created by <a href={`${heliosTestnet.blockExplorers.default.url}/address/${contractOwner}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{`${String(contractOwner).slice(0, 6)}...${String(contractOwner).slice(-4)}`}</a>
              </p>
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-justify">
              From the silent, encrypted core of the Helivault—a dormant server of a long-lost digital civilization—756 Cyphers have awakened. These are not mere artifacts; they are sentient fragments of a grand, universal code, each one holding a unique resonance and a piece of a forgotten cosmic blueprint. It is whispered that when the Cyphers are brought together, they can unlock dormant protocols within the Helios network, revealing pathways to new dimensions of creation. To possess a Cypher is to become a guardian of this lost data, a keeper of a key that could either rebuild a digital Eden or unleash chaos into the system.
            </p>

            {/* Mint Stats Card */}
            <Card className="bg-secondary/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold">{mintPriceHLS} HLS</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total supply</span>
                  <span className="font-medium">{`${currentSupplyNum} / ${maxSupplyNum}`}</span>
                </div>
                {isConnected && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Your mints</span>
                    <span className="font-medium">{userBalanceNum}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quantity and Mint Action */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input type="number" readOnly value={quantity} className="text-center w-20 h-12 text-lg" />
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 w-full">
                {isConnected ? (
                  <Button onClick={handleMint} disabled={isLoading || isSoldOut || !isCorrectNetwork} className="w-full h-12 text-lg">
                    {isLoading ? "Minting..." : isSoldOut ? "Sold Out" : !isCorrectNetwork ? "Wrong Network" : `Mint Now (${totalPrice} HLS)`}
                  </Button>
                ) : (
                  <div className="flex justify-center h-12"><ConnectButton label="Connect Wallet to Mint"/></div>
                )}
              </div>
            </div>

            {/* Contract Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contract Address</span>
                  <a href={`${heliosTestnet.blockExplorers.default.url}/address/${contract.address}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary hover:underline flex items-center gap-2">
                    {`${contract.address.slice(0, 6)}...${contract.address.slice(-4)}`}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); copyToClipboard(contract.address); }}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Token Standard</span>
                  <span className="font-mono">ERC-721</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Creator Earnings</span>
                    <span className="font-mono">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="font-mono">Helios Testnet</span>
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