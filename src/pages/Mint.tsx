import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Wallet } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { web3Service } from "@/services/web3Service";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const ipfsToHttp = (url: string) =>
    url.replace(
      "ipfs://",
      "https://amaranth-defiant-locust-313.mypinata.cloud/ipfs/"
    );

  const fetchNextTokenImage = async () => {
    try {
      if (!contractData) return;
      const nextTokenId = contractData.currentSupply;
      const { address: contractAddress, abi } = web3Service.getContract();
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      const tokenUri: string = await contract.tokenURI(nextTokenId);
      const metadataRes = await fetch(ipfsToHttp(tokenUri));
      const metadata = await metadataRes.json();
      const image = ipfsToHttp(metadata.image);
      setImageUrl(image);
    } catch (err) {
      console.error("Failed to load image", err);
    }
  };

  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      refreshContractData();
    }
  }, [isConnected, isCorrectNetwork, refreshContractData]);

  useEffect(() => {
    if (contractData) {
      fetchNextTokenImage();
    }
  }, [contractData]);

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
      alert(`🎉 NFT Minted!\n\nTransaction Hash: ${result.hash}`);
      setTimeout(refreshContractData, 3000);
    } catch (error: any) {
      alert(`Minting failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* NFT Image */}
              <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="NFT Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">Loading image...</div>
                )}
              </div>

              {/* Mint Interface */}
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">
                  Helivault NFT #
                  {contractData
                    ? (contractData.currentSupply + 1)
                        .toString()
                        .padStart(3, "0")
                    : "001"}
                </h1>

                <div className="text-muted-foreground text-sm">
                  Born from the cosmic storms of the Helivault dimension, this NFT
                  holds the power of digital creation.
                </div>

                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mint Price</span>
                    <span className="font-bold text-lg">
                      {contractData ? contractData.mintPrice : "0.01"} HLS
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Supply</span>
                    <span className="font-medium">
                      {contractData
                        ? `${contractData.currentSupply} / ${contractData.maxSupply}`
                        : "0 / 1000"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Your NFTs</span>
                    <span className="font-medium text-success">
                      {contractData ? contractData.userBalance : 0}
                    </span>
                  </div>
                </div>

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
                      Minting...
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Mint;
