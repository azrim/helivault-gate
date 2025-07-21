// src/pages/Gallery.tsx
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { HELIVAULT_NFT_CONTRACT } from '@/contracts/HelivaultNFT';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LayoutGrid as GalleryIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Helmet } from 'react-helmet-async';

interface NftMetadata {
  name: string;
  description: string;
  image: string;
}

const NftCard = ({ tokenId }: { tokenId: bigint }) => {
  const { data: tokenURIResult, isLoading: isUriLoading } = useReadContract({
    ...HELIVAULT_NFT_CONTRACT,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const [metadata, setMetadata] = useState<NftMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (tokenURIResult) {
        try {
          const response = await fetch(tokenURIResult as string);
          const data: NftMetadata = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error("Failed to fetch NFT metadata:", error);
        } finally {
          setLoading(false);
        }
      } else if (!isUriLoading) {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [tokenURIResult, isUriLoading]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full h-48" />
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card className="overflow-hidden">
        <div className="w-full h-48 bg-secondary flex items-center justify-center">
          <p className="text-muted-foreground">Metadata not found</p>
        </div>
        <CardHeader>
          <CardTitle>Token #{tokenId.toString()}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transform transition-transform hover:scale-105 shadow-lg">
      <img src={metadata.image} alt={metadata.name} className="w-full h-48 object-cover" />
      <CardHeader>
        <CardTitle>{metadata.name}</CardTitle>
        <p className="text-sm text-muted-foreground">Token ID: {tokenId.toString()}</p>
      </CardHeader>
    </Card>
  );
};

const Gallery = () => {
  const { address, isConnected } = useAccount();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);

  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    ...HELIVAULT_NFT_CONTRACT,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: isConnected,
    },
  });

  const { data: ownedTokens, isLoading: isTokensLoading } = useReadContract({
    ...HELIVAULT_NFT_CONTRACT,
    functionName: 'tokensOfOwner',
    args: [address!],
    query: {
        enabled: isConnected && balance !== undefined && balance > 0,
    },
  });

  useEffect(() => {
    if (ownedTokens) {
        // @ts-ignore
      setTokenIds(ownedTokens);
    }
  }, [ownedTokens]);

  const isLoading = isBalanceLoading || isTokensLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet><title>My NFT Gallery – Helivault</title></Helmet>
      <div className="flex items-center gap-4 mb-8">
        <GalleryIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">My NFT Gallery</h1>
      </div>

      {!isConnected ? (
        <Alert className="max-w-md mx-auto">
          <AlertTitle>Connect Your Wallet</AlertTitle>
          <AlertDescription>
            Please connect your wallet to see your Helivault NFTs.
          </AlertDescription>
          <div className="mt-4 flex justify-center">
            <ConnectButton />
          </div>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : tokenIds.length === 0 ? (
        <Alert>
          <AlertTitle>No NFTs Found</AlertTitle>
          <AlertDescription>
            You do not own any Helivault NFTs yet. Visit the Mint page to get started!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tokenIds.map(tokenId => (
            <NftCard key={tokenId.toString()} tokenId={tokenId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;