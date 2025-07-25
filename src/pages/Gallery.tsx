// src/pages/Gallery.tsx
import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { HELIVAULT_COLLECTIONS_CONTRACT } from "@/contracts/HelivaultCollections";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Image as ImageIcon,
  Wallet,
  AlertTriangle,
  Search,
} from "lucide-react";

import Page from "@/components/Page";
import { readContract } from "@wagmi/core";
import { config } from "@/config/reown";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  NftDetailModal,
  NftMetadata,
} from "@/components/ui/NftDetailModal";

const ITEMS_PER_PAGE = 8;

const NftCard = ({
  tokenId,
  onSelect,
}: {
  tokenId: bigint;
  onSelect: (tokenId: bigint, metadata: NftMetadata) => void;
}) => {
  const { data: tokenURIResult } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "tokenURI",
    args: [tokenId],
  });

  const [metadata, setMetadata] = useState<NftMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (typeof tokenURIResult !== "string" || !tokenURIResult) {
        if (tokenURIResult !== undefined) setError(true);
        setLoading(false);
        return;
      }

      // Patch for contract returning URI with token ID appended (e.g. .../metadata.json1)
      const correctedUri = tokenURIResult.replace(/(\.json)\d+$/, "$1");

      let data: NftMetadata | null = null;

      if (correctedUri.startsWith("ipfs://")) {
        const ipfsHash = correctedUri.replace("ipfs://", "");
        const gateways = [
          "https://gateway.pinata.cloud/ipfs/",
          "https://ipfs.io/ipfs/",
          "https://cloudflare-ipfs.com/ipfs/",
          "https://dweb.link/ipfs/",
        ];

        for (const gateway of gateways) {
          try {
            const response = await fetch(gateway + ipfsHash);
            if (response.ok) {
              data = await response.json();
              setMetadata(data);
              break; // Success
            }
          } catch (e) {
            console.warn(`Gateway ${gateway} failed for ${ipfsHash}`);
          }
        }
      } else if (correctedUri.startsWith("https://")) {
        try {
          const response = await fetch(correctedUri);
          if (response.ok) {
            data = await response.json();
            setMetadata(data);
          }
        } catch (e) {
          console.error(`Failed to fetch from ${correctedUri}`, e);
        }
      }

      if (!data) {
        setError(true);
        console.error(
          `Failed to fetch metadata for token ${tokenId} from URI: ${correctedUri}`,
        );
      }

      setLoading(false);
    };

    fetchMetadata();
  }, [tokenURIResult, tokenId]);

  if (loading) {
    return <Skeleton className="w-full h-80 rounded-lg" />;
  }

  if (error || !metadata) {
    return (
      <div className="border-2 border-dashed border-destructive/50 rounded-lg h-80 flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="font-bold text-lg text-destructive">
          Metadata Error
        </h3>
        <p className="text-sm text-muted-foreground">
          Could not load metadata for Token ID: {tokenId.toString()}
        </p>
      </div>
    );
  }

  const resolveImageUrl = (imageUri: string) => {
    if (imageUri.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${imageUri.replace("ipfs://", "")}`;
    }
    return imageUri;
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card border rounded-lg overflow-hidden group cursor-pointer"
      onClick={() => onSelect(tokenId, metadata)}
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={resolveImageUrl(metadata.image)}
          alt={metadata.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg truncate" title={metadata.name}>
          {metadata.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Token ID: {tokenId.toString()}
        </p>
        <Button variant="secondary" className="w-full mt-2">
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

const Gallery = () => {
  const { address, isConnected } = useAccount();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
  const [selectedMetadata, setSelectedMetadata] = useState<NftMetadata | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewAll, setViewAll] = useState(false);

  // Data fetching
  const { data: balance } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected && !viewAll },
  });

  const { data: totalSupply } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "totalSupply",
    query: { enabled: viewAll },
  });

  useEffect(() => {
    const fetchTokenIds = async () => {
      setIsLoading(true);
      let ids: bigint[] = [];
      try {
        if (viewAll) {
          const currentTotalSupply = await readContract(config, {
            ...HELIVAULT_COLLECTIONS_CONTRACT,
            functionName: "totalSupply",
          });
          if (typeof currentTotalSupply === "bigint") {
            ids = Array.from(
              { length: Number(currentTotalSupply) },
              (_, i) => BigInt(i),
            );
          }
        } else if (isConnected && typeof balance === "bigint") {
          ids = await Promise.all(
            Array.from({ length: Number(balance) }).map((_, i) =>
              readContract(config, {
                ...HELIVAULT_COLLECTIONS_CONTRACT,
                functionName: "tokenOfOwnerByIndex",
                args: [address!, BigInt(i)],
              }),
            ),
          );
        }
        setTokenIds(ids.reverse() as bigint[]); // Show newest first
      } catch (error) {
        console.error("Error fetching token IDs:", error);
        setTokenIds([]);
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
      }
    };
    fetchTokenIds();
  }, [balance, address, isConnected, viewAll]);

  // Filtering and Pagination
  const filteredTokenIds = useMemo(() => {
    if (!searchTerm) return tokenIds;
    // This is a placeholder for client-side search.
    // For a full implementation, we'd need to fetch metadata for all tokens.
    // For now, it just filters the already fetched token IDs.
    return tokenIds.filter((id) => id.toString().includes(searchTerm));
  }, [tokenIds, searchTerm]);

  const paginatedTokenIds = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTokenIds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTokenIds, currentPage]);

  const totalPages = Math.ceil(filteredTokenIds.length / ITEMS_PER_PAGE);

  // Handlers
  const handleSelectNft = (tokenId: bigint, metadata: NftMetadata) => {
    setSelectedTokenId(tokenId);
    setSelectedMetadata(metadata);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderContent = () => {
    if (!isConnected && !viewAll) {
      return (
        <div className="text-center space-y-4 py-16">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to view your NFT gallery.
          </p>
          <Button
            onClick={() => {
              /* This will be handled by the ConnectWallet button in the nav */
            }}
          >
            Connect Your Wallet
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="w-full h-80 rounded-lg" />
          ))}
        </div>
      );
    }

    if (filteredTokenIds.length === 0) {
      return (
        <div className="text-center space-y-4 py-16">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            {searchTerm ? "No Results Found" : "Gallery is Empty"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? `No NFTs matched your search for "${searchTerm}".`
              : "No NFTs to display."}
          </p>
          {!viewAll && !searchTerm && (
            <Button asChild>
              <Link to="/mint">Mint Your First NFT</Link>
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedTokenIds.map((tokenId) => (
            <NftCard
              key={tokenId.toString()}
              tokenId={tokenId}
              onSelect={handleSelectNft}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Page
      title="My Gallery"
      description="Here are the unique digital relics you've collected from the Helivault ecosystem."
    >
      <NftDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tokenId={selectedTokenId}
        metadata={selectedMetadata}
      />
      <div className="space-y-12 pb-24">
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
            Browse your collection or explore all NFTs minted in the Helivault
            ecosystem.
          </motion.p>
        </section>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Token ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-all-switch">My NFTs</Label>
            <Switch
              id="view-all-switch"
              checked={viewAll}
              onCheckedChange={setViewAll}
            />
            <Label htmlFor="view-all-switch">All NFTs</Label>
          </div>
        </div>

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
