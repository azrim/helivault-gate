// src/pages/Mint.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { HELIVAULT_NFT_CONTRACT } from "@/contracts/HelivaultNFT";
import { heliosTestnet } from "@/lib/chains";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Mint = () => {
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();
  const { data: hash, isPending: isMinting, writeContractAsync } = useWriteContract();

  const contract = {
    address: HELIVAULT_NFT_CONTRACT.address,
    abi: HELIVAULT_NFT_CONTRACT.abi,
  } as const;

  const { data: totalSupply } = useReadContract({
    ...contract,
    functionName: 'totalSupply',
    query: { enabled: isConnected },
  });

  const { data: maxSupply } = useReadContract({
    ...contract,
    functionName: 'maxSupply',
    query: { enabled: isConnected },
  });

  const { data: mintPrice } = useReadContract({
    ...contract,
    functionName: 'mintPrice',
    query: { enabled: isConnected },
  });

  const { data: userBalance } = useReadContract({
    ...contract,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleMint = async () => {
    if (!mintPrice) {
      toast.error("Contract data not loaded yet. Please wait a moment.");
      return;
    }

    try {
      await writeContractAsync({
        ...contract,
        functionName: 'mint',
        value: mintPrice,
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
    if (isConfirmed) {
      toast.success("🎉 NFT Minted Successfully!", {
        description: (
          <a
            href={`${heliosTestnet.blockExplorers.default.url}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-sm text-blue-500 hover:text-blue-600"
          >
            View on Explorer ↗
          </a>
        ),
        duration: 5000,
      });
      queryClient.invalidateQueries();
    }
  }, [isConfirmed, hash, queryClient]);

  const currentSupplyNum = typeof totalSupply !== 'undefined' ? Number(totalSupply) : 0;
  const maxSupplyNum = typeof maxSupply !== 'undefined' ? Number(maxSupply) : 1000;
  const mintPriceHLS = typeof mintPrice !== 'undefined' ? formatEther(mintPrice) : "0.01";
  const userBalanceNum = typeof userBalance !== 'undefined' ? Number(userBalance) : 0;
  const isSoldOut = currentSupplyNum >= maxSupplyNum;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const isLoading = isMinting || isConfirming;
  const nextTokenId = currentSupplyNum + 1;
  const nftImageUrl = `https://amaranth-defiant-locust-313.mypinata.cloud/ipfs/bafybeia5eyoxedwqftrcab4gw5jamfxxvtanbf3y7cipan7rtzqvty62mi/vault${nextTokenId}.png`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mint – Helivault Gate</title>
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
                    alt="Helivault NFT"
                    className="object-cover w-full h-full rounded-xl transition-opacity duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/vault-placeholder.png";
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center w-full lg:w-1/2 space-y-6">
                <div className="w-full max-w-xl space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Helivault NFT #{nextTokenId.toString().padStart(3, "0")}
                    </h1>
                    <div className="text-sm text-muted-foreground mb-4">
                      Collection: Genesis Series
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Lore</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Born from the cosmic storms of the Helivault dimension, this NFT
                      carries the ancient power of digital creation. Each piece holds
                      unique properties that unlock special abilities within the
                      metaverse.
                    </p>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Mint Price</span>
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
                  
                  {isConnected ? (
                     <Button
                        onClick={handleMint}
                        disabled={isLoading || isSoldOut || !isCorrectNetwork}
                        className="w-full h-12 text-lg bg-brand-gradient hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                      {isLoading ? (
                        <><div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Minting...</>
                      ) : isSoldOut ? (
                        "Sold Out"
                      ) : !isCorrectNetwork ? (
                        "Wrong Network"
                      ) : (
                        <><Zap className="w-5 h-5 mr-2" />Mint NFT ({mintPriceHLS} HLS)</>
                      )}
                    </Button>
                  ) : (
                    <div className="flex justify-center">
                       <ConnectButton label="Connect Wallet to Mint"/>
                    </div>
                  )}

                  {/* --- FIX: Use openChainModal to switch networks --- */}
                  {!isConnected || isCorrectNetwork ? null : (
                    <div className="flex justify-center">
                      <ConnectButton.Custom>
                        {({ openChainModal }) => {
                          return (
                            <Button onClick={openChainModal} variant="destructive" className="w-full">
                              Switch to Helios Testnet
                            </Button>
                          );
                        }}
                      </ConnectButton.Custom>
                    </div>
                  )}
                  {/* --- END FIX --- */}

                  {hash && (
                    <div className="bg-secondary/20 border border-border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Tx</span>
                        <a
                          href={`${heliosTestnet.blockExplorers.default.url}/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-mono"
                        >
                          {hash.slice(0, 10)}...{hash.slice(-8)}
                        </a>
                      </div>
                    </div>
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