// src/pages/Staking.tsx
import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { STAKING_CONTRACT } from "@/contracts/Staking";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { heliosTestnet } from "@/lib/chains";
import { formatEther, parseEther } from "viem";

const Staking = () => {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  // --- Data Refetching ---
  const refetchAll = useCallback(() => {
    refetchHvtBalance();
    refetchStakedBalance();
    refetchRewards();
    refetchAllowance();
  }, []);

  // --- Transaction Confirmation ---
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
    onSuccess: (data) => {
      toast.success("Transaction confirmed!", {
        description: `Transaction hash: ${data.transactionHash}`,
      });
      refetchAll();
      setStakeAmount("");
      setUnstakeAmount("");
      setHash(undefined);
    },
    onError: (error) => {
      toast.error("Transaction confirmation failed", {
        description: error.message,
      });
    },
  });

  // --- Contract Reads ---
  const { data: hvtBalance, refetch: refetchHvtBalance } = useBalance({
    address: address,
    token: HELIVAULT_TOKEN_CONTRACT.address as `0x${string}`,
    query: { enabled: isConnected },
  });

  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    ...STAKING_CONTRACT,
    functionName: 'stakedBalances',
    args: [address!],
    query: { enabled: isConnected },
  });

  const { data: rewards, refetch: refetchRewards } = useReadContract({
    ...STAKING_CONTRACT,
    functionName: 'userRewards',
    args: [address!],
    query: { enabled: isConnected },
  });
  
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: 'allowance',
    args: [address!, STAKING_CONTRACT.address as `0x${string}`],
    query: { enabled: isConnected },
  });

  // --- Contract Writes ---
  const handleWrite = async (func: () => Promise<`0x${string}` | undefined>, type: string) => {
    try {
      const txHash = await func();
      if (txHash) {
        setHash(txHash);
        toast.info(`${type} transaction sent...`);
      }
    } catch (error: any) {
      toast.error(`${type} failed`, { description: error.shortMessage || "An error occurred." });
    }
  };

  const handleApprove = () => handleWrite(() => writeContractAsync({
    ...HELIVAULT_TOKEN_CONTRACT,
    functionName: 'approve',
    args: [STAKING_CONTRACT.address as `0x${string}`, parseEther(stakeAmount)],
    account: address,
    chain: heliosTestnet,
  }), "Approval");

  const handleStake = () => handleWrite(() => writeContractAsync({
    ...STAKING_CONTRACT,
    functionName: 'stake',
    args: [parseEther(stakeAmount)],
    account: address,
    chain: heliosTestnet,
  }), "Stake");
  
  const handleUnstake = () => handleWrite(() => writeContractAsync({
    ...STAKING_CONTRACT,
    functionName: 'unstake',
    args: [parseEther(unstakeAmount)],
    account: address,
    chain: heliosTestnet,
  }), "Unstake");

  const handleClaim = () => handleWrite(() => writeContractAsync({
    ...STAKING_CONTRACT,
    functionName: 'claimRewards',
    account: address,
    chain: heliosTestnet,
  }), "Claim");

  const isCorrectNetwork = chain?.id === heliosTestnet.id;
  const needsApproval = typeof allowance === 'bigint' && typeof stakeAmount === 'string' && stakeAmount && allowance < parseEther(stakeAmount);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>HVT Staking</CardTitle>
          <CardDescription>Stake your HVT to earn rewards.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Your HVT Balance</p>
              <p className="text-2xl font-bold">{hvtBalance?.formatted ? parseFloat(hvtBalance.formatted).toFixed(4) : 0} {hvtBalance?.symbol}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Your Staked Balance</p>
              <p className="text-2xl font-bold">{typeof stakedBalance === 'bigint' ? formatEther(stakedBalance) : 0} HVT</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Claimable Rewards</p>
              <p className="text-2xl font-bold">{typeof rewards === 'bigint' ? formatEther(rewards) : 0} HVT</p>
            </div>
          </div>
           <Button onClick={handleClaim} disabled={!rewards || rewards === 0n || isConfirming} className="w-full">
            {isConfirming ? "Confirming..." : "Claim Rewards"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Stake Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="number"
              placeholder="Amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            {!isConnected ? (
                <ConnectButton label="Connect Wallet to Stake" />
            ) : !isCorrectNetwork ? (
                <ConnectButton label="Wrong Network" />
            ) : needsApproval ? (
              <Button onClick={handleApprove} disabled={isConfirming} className="w-full">
                {isConfirming ? "Confirming..." : "Approve HVT"}
              </Button>
            ) : (
              <Button onClick={handleStake} disabled={!stakeAmount || isConfirming} className="w-full">
                {isConfirming ? "Confirming..." : "Stake"}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unstake Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Amount to unstake"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
            />
             {!isConnected ? (
                <ConnectButton label="Connect Wallet to Unstake" />
            ) : !isCorrectNetwork ? (
                <ConnectButton label="Wrong Network" />
            ) : (
              <Button onClick={handleUnstake} disabled={!unstakeAmount || isConfirming} className="w-full" variant="secondary">
                {isConfirming ? "Confirming..." : "Unstake"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Staking;
