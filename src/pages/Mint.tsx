import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Wallet } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";

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

  // Refresh contract data on mount and when connected
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
      alert("Contract data not loaded. Please refresh the page.");
      return;
    }

    if (contractData.currentSupply >= contractData.maxSupply) {
      alert("Maximum supply reached! No more NFTs available.");
      return;
    }

    setIsMinting(true);
    try {
      const result = await mintNFTFromContract();
      setLastTxHash(result.hash);

      // Show success message with transaction hash
      alert(
        `🎉 NFT Minted Successfully!\n\nTransaction Hash: ${result.hash}\n\nYour NFT will appear in your wallet shortly.`,
      );

      // Refresh contract data after a delay
      setTimeout(refreshContractData, 3000);
    } catch (error: any) {
      console.error("Minting failed:", error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
        {/* Main NFT Mint Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* NFT Image */}
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-80"></div>
                <div className="relative z-10 text-center text-white">
                  <div className="text-6xl font-bold mb-2">
                    #
                    {contractData
                      ? (contractData.currentSupply + 1)
                          .toString()
                          .padStart(3, "0")
                      : "001"}
                  </div>
                  <div className="text-lg">Helivault NFT</div>
                  {contractData && (
                    <div className="text-sm mt-2 opacity-80">
                      {contractData.currentSupply} / {contractData.maxSupply}{" "}
                      minted
                    </div>
                  )}
                </div>
              </div>

              {/* Mint Interface */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Helivault NFT #
                    {contractData
                      ? (contractData.currentSupply + 1)
                          .toString()
                          .padStart(3, "0")
                      : "001"}
                  </h1>
                  <div className="text-sm text-muted-foreground mb-4">
                    Collection: Genesis Series
                  </div>
                </div>

                {/* Lore */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Lore</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Born from the cosmic storms of the Helivault dimension, this
                    NFT carries the ancient power of digital creation. Each
                    piece holds unique properties that unlock special abilities
                    within the metaverse, making it not just art, but a key to
                    infinite possibilities.
                  </p>
                </div>

                {/* Mint Price & Stats */}
                <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Mint Price
                    </span>
                    <span className="text-lg font-bold">
                      {contractData ? contractData.mintPrice : "0.01"} HLS
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Supply
                    </span>
                    <span className="font-medium">
                      {contractData
                        ? `${contractData.currentSupply} / ${contractData.maxSupply}`
                        : "0 / 1000"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Your NFTs
                    </span>
                    <span className="font-medium text-success">
                      {contractData ? contractData.userBalance : 0}
                    </span>
                  </div>
                  {contractData &&
                    contractData.currentSupply >= contractData.maxSupply && (
                      <div className="bg-warning/10 border border-warning/20 rounded p-2 text-center">
                        <span className="text-sm text-warning font-medium">
                          ⚠️ Maximum supply reached!
                        </span>
                      </div>
                    )}
                </div>

                {/* Wallet Status */}
                {isConnected && (
                  <div
                    className={`border rounded-lg p-3 text-sm ${
                      isCorrectNetwork
                        ? "bg-success/10 border-success/20"
                        : "bg-warning/10 border-warning/20"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Wallet Balance
                      </span>
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

                {/* Mint Button */}
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
                    <>
                      <span>Sold Out</span>
                    </>
                  ) : isMinting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Minting NFT...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Mint NFT ({contractData
                        ? contractData.mintPrice
                        : "0.01"}{" "}
                      HLS)
                    </>
                  )}
                </Button>

                {/* Transaction Hash Display */}
                {lastTxHash && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Last Transaction
                      </span>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Mint;
