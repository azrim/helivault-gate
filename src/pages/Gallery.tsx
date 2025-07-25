// src/pages/Gallery.tsx
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { HELIVAULT_COLLECTIONS_CONTRACT } from "@/contracts/HelivaultCollections";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Image as ImageIcon, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Page from "@/components/Page";
import { readContract } from "@wagmi/core";
import { config } from "@/App";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NftMetadata {
  name: string;
  description: string;
  image: string;
}

const NftCard = ({ tokenId }: { tokenId: bigint }) => {
  const { data: tokenURIResult } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "tokenURI",
    args: [tokenId],
  });

  const [metadata, setMetadata] = useState<NftMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (typeof tokenURIResult === "string" && tokenURIResult) {
        try {
          const response = await fetch(
            tokenURIResult.replace("ipfs://", "https://ipfs.io/ipfs/"),
          );
          const data: NftMetadata = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error("Failed to fetch NFT metadata:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [tokenURIResult]);

  if (loading) {
    return <Skeleton className="w-full h-64 rounded-lg" />;
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-4 rounded-lg space-y-3"
    >
      <img
        src={metadata?.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
        alt={metadata?.name || `Token #${tokenId}`}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="font-bold text-lg">
        {metadata?.name || `Token #${tokenId}`}
      </h3>
      <p className="text-sm text-muted-foreground">
        Token ID: {tokenId.toString()}
      </p>
    </motion.div>
  );
};

const Gallery = () => {
  const { address, isConnected } = useAccount();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: balance } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected },
  });

  useEffect(() => {
    const fetchTokenIds = async () => {
      if (isConnected && typeof balance === "bigint") {
        try {
          const ids = await Promise.all(
            Array.from({ length: Number(balance) }).map((_, i) =>
              readContract(config, {
                ...HELIVAULT_COLLECTIONS_CONTRACT,
                functionName: "tokenOfOwnerByIndex",
                args: [address!, BigInt(i)],
              }),
            ),
          );
          setTokenIds(ids as bigint[]);
        } catch (error) {
          console.error("Error fetching token IDs:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!isConnected) {
        setIsLoading(false);
      }
    };
    fetchTokenIds();
  }, [balance, address, isConnected]);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center space-y-4">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to view your NFT gallery.
          </p>
          <ConnectButton />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      );
    }

    if (tokenIds.length === 0) {
      return (
        <div className="text-center space-y-4">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">Your Gallery is Empty</h3>
          <p className="text-muted-foreground">
            You haven&apos;t minted any NFTs yet. Let&apos;s change that!
          </p>
          <Button asChild>
            <Link to="/mint">Mint Your First NFT</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tokenIds.map((tokenId) => (
          <NftCard key={tokenId.toString()} tokenId={tokenId} />
        ))}
      </div>
    );
  };

  return (
    <Page
      title="My Gallery"
      description="Here are the unique digital relics you've collected from the Helivault ecosystem."
    >
      <div className="space-y-16 pb-24">
        {/* Header */}
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your <span className="text-primary">Digital Collection</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Here are the unique digital relics you've collected from the
            Helivault ecosystem.
          </motion.p>
        </section>

        {/* Gallery Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {renderContent()}
        </motion.section>
      </div>
    </Page>
  );
};

export default Gallery;
