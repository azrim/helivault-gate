import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useAccount, useReadContract } from "wagmi";
import { HELIVAULT_NFT_CONTRACT } from "@/contracts/HelivaultNFT";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// --- FIX: Define the contract config outside the component ---
// This prevents it from being recreated on every render, which was causing an infinite loop.
const contractConfig = {
  address: HELIVAULT_NFT_CONTRACT.address,
  abi: HELIVAULT_NFT_CONTRACT.abi,
} as const;

const History = () => {
  const { address, isConnected } = useAccount();
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: balanceResult, isLoading: isBalanceLoading } = useReadContract({
    ...contractConfig,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  const { data: mintPriceResult } = useReadContract({
    ...contractConfig,
    functionName: 'mintPrice',
  });

  const mintPrice = mintPriceResult ? formatEther(mintPriceResult) : "—";
  
  useEffect(() => {
    // This effect fetches all token IDs one by one. 
    // For large collections, this can be slow. A dedicated `tokensOfOwner` function in the contract is usually better.
    const fetchAllTokens = async () => {
      if (!balanceResult || balanceResult === 0n) {
        setTokenIds([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Dynamic import of wagmi's public client for reads
      const { createPublicClient, http } = await import('viem');
      const { heliosTestnet } = await import('@/lib/chains');
      const client = createPublicClient({ chain: heliosTestnet, transport: http() });

      const tokenPromises = [];
      for (let i = 0n; i < balanceResult; i++) {
        tokenPromises.push(client.readContract({
          ...contractConfig,
          functionName: 'tokenOfOwnerByIndex',
          args: [address!, i],
        }));
      }
      
      try {
        const results = await Promise.all(tokenPromises);
        const ids = results.map(tokenId => Number(tokenId));
        setTokenIds(ids);
      } catch (error) {
        console.error("Error fetching token IDs:", error);
        setTokenIds([]); // Clear tokens on error
      } finally {
        setLoading(false);
      }
    };

    if (isConnected) {
      fetchAllTokens();
    } else {
      setLoading(false);
    }
    // --- FIX: The dependency array is now stable ---
  }, [balanceResult, isConnected, address]);


  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>History – Helivault Gate</title>
      </Helmet>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Mint History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-4 px-4 rounded-l-lg font-medium text-sm text-muted-foreground">NFT</th>
                    <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground">Token ID</th>
                    <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground">Price</th>
                    <th className="text-right py-4 px-4 rounded-r-lg font-medium text-sm text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!isConnected ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-4">
                           Please connect your wallet to view mint history.
                           <ConnectButton />
                        </div>
                      </td>
                    </tr>
                  ) : loading || isBalanceLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center">Loading...</td>
                    </tr>
                  ) : tokenIds.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center">No NFTs found for this address.</td>
                    </tr>
                  ) : (
                    tokenIds.map((id, index) => (
                      <tr key={id} className="border-b border-border last:border-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded ${index % 2 === 0 ? "bg-gradient-to-br from-purple-400 to-blue-400" : "bg-gradient-to-br from-pink-400 to-purple-400"}`} />
                            <span className="font-medium">Helivault NFT</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">#{id}</td>
                        <td className="py-4 px-4 font-medium">{mintPrice} HLS</td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
                            Minted
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;