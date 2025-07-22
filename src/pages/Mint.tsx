// src/pages/Mint.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConfig,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { HELIVAULT_COLLECTIONS_CONTRACT } from "@/contracts/HelivaultCollections";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { heliosTestnet } from "@/lib/chains";
import {
  formatEther,
  TransactionExecutionError,
  type WaitForTransactionReceiptReturnType,
} from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const contractConfig = HELIVAULT_COLLECTIONS_CONTRACT;

const HistoryRow = ({
  ownerAddress,
  index,
  nftName,
  mintPrice,
}: {
  ownerAddress: `0x${string}`;
  index: bigint;
  nftName: string;
  mintPrice: string;
}) => {
  const {
    data: tokenIdResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...contractConfig,
    functionName: "tokenOfOwnerByIndex",
    args: [ownerAddress, index],
  });

  const tokenId =
    typeof tokenIdResult === "bigint" ? Number(tokenIdResult) : null;

  if (isLoading) {
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={4} className="py-4 px-4 text-center">
          Loading token data...
        </td>
      </tr>
    );
  }

  if (isError) {
    console.error(`Error fetching token at index ${index}:`, error);
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={4} className="py-4 px-4 text-center text-red-500">
          <div className="flex flex-col items-center justify-center gap-2">
            <span>Failed to load Token #{index.toString()}.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  if (tokenId === null) return null;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded ${Number(index) % 2 === 0 ? "bg-gradient-to-br from-purple-400 to-blue-400" : "bg-gradient-to-br from-pink-400 to-purple-400"}`}
          />
          <span className="font-medium">{nftName}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-center text-muted-foreground">
        #{tokenId}
      </td>
      <td className="py-4 px-4 text-center font-medium">{mintPrice} HVT</td>
      <td className="py-4 px-4 text-right">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
          Minted
        </span>
      </td>
    </tr>
  );
};

const Mint = () => {
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();
  const { address, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [mintingStep, setMintingStep] = useState<
    "idle" | "approving" | "minting"
  >("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [activeToastId, setActiveToastId] = useState<
    string | number | undefined
  >();

  const nftContract = HELIVAULT_COLLECTIONS_CONTRACT;
  const tokenContract = HELIVAULT_TOKEN_CONTRACT;
  const isConnected = !!address;

  // --- Data Fetching ---
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    ...nftContract,
    functionName: "totalSupply",
  });
  const { data: maxSupply } = useReadContract({
    ...nftContract,
    functionName: "maxSupply",
  });
  const { data: mintPriceResult } = useReadContract({
    ...nftContract,
    functionName: "mintPrice",
  });
  const {
    data: userBalanceResult,
    isLoading: isBalanceLoading,
    refetch: refetchUserBalance,
  } = useReadContract({
    ...nftContract,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected },
  });
  const { data: nftNameResult } = useReadContract({
    ...nftContract,
    functionName: "name",
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...tokenContract,
    functionName: "allowance",
    args: [address!, nftContract.address],
    query: { enabled: isConnected },
  });

  const { isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });

  // --- Main Minting Logic ---
  const handleMint = async () => {
    if (
      !address ||
      !chain ||
      typeof mintPriceResult === "undefined" ||
      quantity <= 0
    )
      return;
    const totalCost = (mintPriceResult as bigint) * BigInt(quantity);

    const toastId = toast.loading("Initializing transaction...");
    setActiveToastId(toastId);

    try {
      if (typeof allowance !== "bigint" || allowance < totalCost) {
        setMintingStep("approving");
        toast.loading("Approval required, please confirm in wallet.", {
          id: toastId,
        });

        const approvalHash = await writeContractAsync({
          ...tokenContract,
          functionName: "approve",
          args: [nftContract.address, totalCost],
          account: address,
          chain: chain,
        });

        toast.loading("Processing approval...", {
          id: toastId,
          description: "Waiting for confirmation.",
        });
        const approvalReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: approvalHash,
        });

        if (approvalReceipt.status === "reverted") {
          throw new Error("Approval transaction was reverted.");
        }

        toast.success("Approval successful!", { id: toastId, duration: 2000 });
        await refetchAllowance();
      }

      setMintingStep("minting");
      toast.loading("Minting your NFT...", {
        id: toastId,
        description: "Please confirm in your wallet.",
      });

      const mintTxHash = await writeContractAsync({
        ...nftContract,
        functionName: "mint",
        args: [BigInt(quantity)],
        account: address,
        chain: chain,
      });
      setTxHash(mintTxHash);
    } catch (error: unknown) {
      console.error("Minting process failed:", error);
      const errorMessage =
        error instanceof TransactionExecutionError
          ? error.shortMessage
          : "The transaction was cancelled or failed.";
      toast.error("Transaction Failed", {
        id: toastId,
        description: errorMessage,
      });
      setMintingStep("idle");
      setActiveToastId(undefined);
    }
  };

  useEffect(() => {
    if (isConfirmed && receipt && activeToastId) {
      if (mintingStep === "minting") {
        toast.success(`🎉 ${quantity} Quantum Relic(s) Minted Successfully!`, {
          id: activeToastId,
          description: (
            <a
              href={`${heliosTestnet.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Explorer ↗
            </a>
          ),
          duration: 8000,
        });
        refetchTotalSupply();
        refetchUserBalance();
      }
      setMintingStep("idle");
      setTxHash(undefined);
      setActiveToastId(undefined);
    }
  }, [
    isConfirmed,
    receipt,
    txHash,
    activeToastId,
    quantity,
    mintingStep,
    refetchTotalSupply,
    refetchUserBalance,
  ]);

  // --- UI State Calculation ---
  const currentSupplyNum =
    typeof totalSupply === "bigint" ? Number(totalSupply) : 0;
  const maxSupplyNum = typeof maxSupply === "bigint" ? Number(maxSupply) : 3999;
  const mintPriceHVT =
    typeof mintPriceResult === "bigint" ? formatEther(mintPriceResult) : "0.39";
  const nftName =
    typeof nftNameResult === "string" ? nftNameResult : "Quantum Relic";
  const userBalance =
    typeof userBalanceResult === "bigint" ? userBalanceResult : 0n;
  const tokenIndices = Array.from({ length: Number(userBalance) }, (_, i) =>
    BigInt(i),
  );

  const isSoldOut = currentSupplyNum >= maxSupplyNum;
  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const isLoading = mintingStep !== "idle";

  const getButtonText = () => {
    if (mintingStep === "approving") return "Approving...";
    if (mintingStep === "minting") return "Minting...";
    if (isLoading) return "Confirming...";
    if (isSoldOut) return "Sold Out";
    if (!isCorrectNetwork) return "Wrong Network";
    return "Mint Now";
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nftImageUrl = `https://bafybeicv24cjsqbiqwiui7txa5rk4yzrx43vaw4wheip4qp6fahpcsuhh4.ipfs.w3s.link/relic.png`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mint & History – Quantum Relics</title>
      </Helmet>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="w-full aspect-square lg:sticky lg:top-28">
            <img
              src={nftImageUrl}
              alt="Quantum Relic"
              className="object-cover w-full h-full rounded-xl shadow-lg top-0 transition-transform transform hover:scale-105 hover:shadow-xl"
            />
          </div>
          <div className="w-full flex flex-col gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Quantum Relics</h1>
              <p className="text-muted-foreground">
                Part of the Helivault NFT Collection
              </p>
            </div>
            <Card className="border-primary/50 border-2 bg-card">
              <CardContent className="flex flex-col gap-4 pt-6">
                <p className="text-4xl font-bold">{mintPriceHVT} HVT</p>
                {isConnected && (
                  <div className="text-sm text-muted-foreground">
                    <span>
                      {currentSupplyNum.toLocaleString()} /{" "}
                      {maxSupplyNum.toLocaleString()} minted
                    </span>
                    <span className="mx-2">•</span>
                    <span>{Number(userBalance)} minted by you</span>
                  </div>
                )}
                <div className="flex gap-4 items-center pt-2">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-[10rem] h-12 text-center text-lg"
                    disabled={isLoading}
                  />
                  <div className="flex-1 w-full">
                    {isConnected ? (
                      <Button
                        onClick={handleMint}
                        disabled={isLoading || isSoldOut || !isCorrectNetwork}
                        className="w-full h-12 text-lg"
                      >
                        {getButtonText()}
                      </Button>
                    ) : (
                      <div className="flex justify-center h-12">
                        <ConnectButton label="Connect Wallet to Mint" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>NFT Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Contract Address
                  </span>
                  <a
                    href={`${heliosTestnet.blockExplorers.default.url}/address/${nftContract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline flex items-center gap-2"
                  >
                    {`${nftContract.address.slice(0, 6)}...${nftContract.address.slice(-4)}`}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(nftContract.address);
                      }}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Token Standard</span>
                  <span className="font-mono">ERC-721</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="font-mono text-right">
                    {chain?.name || "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-12">
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
              <div className="overflow-x-auto space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-center py-4 px-4 rounded-l-lg font-medium text-sm text-muted-foreground">
                        NFT
                      </th>
                      <th className="text-center py-4 px-4 font-medium text-sm text-muted-foreground">
                        Token ID
                      </th>
                      <th className="text-center py-4 px-4 font-medium text-sm text-muted-foreground">
                        Price
                      </th>
                      <th className="text-center py-4 px-4 rounded-r-lg font-medium text-sm text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isConnected ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 px-4 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-4">
                            Please connect your wallet to view mint history.
                            <ConnectButton />
                          </div>
                        </td>
                      </tr>
                    ) : isBalanceLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8 px-4 text-center">
                          Loading NFT history...
                        </td>
                      </tr>
                    ) : tokenIndices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 px-4 text-center">
                          No NFTs found for this address.
                        </td>
                      </tr>
                    ) : (
                      tokenIndices.map((index) => (
                        <HistoryRow
                          key={index.toString()}
                          ownerAddress={address!}
                          index={index}
                          nftName={nftName}
                          mintPrice={mintPriceHVT}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Mint;
