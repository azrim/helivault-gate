import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Wallet } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

const Mint = () => {
  const {
    isConnected,
    address,
    connectWallet,
    balance,
    isCorrectNetwork,
    switchToHelios,
    contractData,
    refreshContractData,
    mintNFT: mintNFTFromContract,
  } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      refreshContractData();
    }
  }, [isConnected, isCorrectNetwork, refreshContractData]);

  const handleMint = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      await switchToHelios();
      return;
    }

    if (!contractData) {
      toast.error("Contract not loaded", {
        description: "Please refresh the page and try again.",
        duration: 5000,
      });
      return;
    }

    if (contractData.currentSupply >= contractData.maxSupply) {
      toast.error("Maximum supply reached", {
        description: "No more NFTs available to mint.",
        duration: 5000,
      });
      return;
    }

    setIsMinting(true);
    try {
      const result = await mintNFTFromContract();
      setLastTxHash(result.hash);
      toast.success("🎉 NFT Minted Successfully!", {
        description: (
          <span>
            <a
              href={`https://explorer.helioschainlabs.org/tx/${result.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sm text-blue-500 hover:text-blue-600"
            >
              View on Explorer ↗
            </a>
          </span>
        ),
        duration: 5000,
      });
      setTimeout(refreshContractData, 3000);
    } catch (error: any) {
      console.error("Minting failed:", error);
      toast.error("Minting failed", {
        description: error.message,
        duration: 5000,
      });
    } finally {
      setIsMinting(false);
    }
  };

  const nextTokenId = contractData ? contractData.currentSupply + 1 : 1;
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
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center min-h-[60vh]">
              {/* NFT IMAGE */}
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

              {/* RIGHT PANEL */}
              <div className="w-full lg:w-1/2 flex justify-center">
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
                      <span className="text-lg font-bold">
                        {contractData ? contractData.mintPrice : "0.01"} HLS
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Supply</span>
                      <span className="font-medium">
                        {contractData
                          ? `${contractData.currentSupply} / ${contractData.maxSupply}`
                          : "0 / 1000"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Your NFTs</span>
                      <span className="font-medium text-success">
                        {contractData ? contractData.userBalance : 0}
                      </span>
                    </div>
                  </div>

                  {isConnected && (
                    <div
                      className={`border rounded-lg p-3 text-sm ${
                        isCorrectNetwork
                          ? "bg-success/10 border-success/20"
                          : "bg-warning/10 border-warning/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Wallet Balance</span>
                        <span className="font-medium">{balance} HLS</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-muted-foreground">Network</span>
                        <span
                          className={`font-medium ${
                            isCorrectNetwork ? "text-success" : "text-warning"
                          }`}
                        >
                          {isCorrectNetwork ? "Helios Testnet" : "Wrong Network"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-muted-foreground">Address</span>
                        <span className="text-success font-medium">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleMint}
                    disabled={
                      isMinting ||
                      (contractData &&
                        contractData.currentSupply >= contractData.maxSupply)
                    }
                    className="w-full h-12 text-lg bg-brand-gradient hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {!isConnected ? (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet to Mint
                      </>
                    ) : !isCorrectNetwork ? (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Switch to Helios Network
                      </>
                    ) : contractData &&
                      contractData.currentSupply >= contractData.maxSupply ? (
                      <>Sold Out</>
                    ) : isMinting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Mint NFT ({contractData ? contractData.mintPrice : "0.01"} HLS)
                      </>
                    )}
                  </Button>

                  {lastTxHash && (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Transaction</span>
                        <a
                          href={`https://explorer.helioschainlabs.org/tx/${lastTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-success hover:underline font-mono"
                        >
                          {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
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
