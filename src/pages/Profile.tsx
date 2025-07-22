// src/pages/Profile.tsx
import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Wallet, Image as ImageIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { HELIVAULT_COLLECTIONS_CONTRACT } from "@/contracts/HelivaultCollections";
import { useReadContract } from "wagmi";
import { Link } from "react-router-dom";

const Profile = () => {
  const { address, isConnected } = useAccount();

  const { data: hlsBalance } = useBalance({ address });
  const { data: hvtBalance } = useBalance({ address, token: HELIVAULT_TOKEN_CONTRACT.address });
  const { data: nftBalance } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected },
  });

  const renderProfile = () => {
    if (!isConnected) {
      return (
        <div className="text-center space-y-4 py-16">
          <User className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-2xl font-semibold">View Your Profile</h3>
          <p className="text-muted-foreground">Connect your wallet to see your balances and NFT collection.</p>
          <ConnectButton />
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Wallet /> Wallet Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Address</span>
              <span className="font-mono text-sm">{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">HLS Balance</span>
              <span className="font-bold">{hlsBalance ? `${parseFloat(hlsBalance.formatted).toFixed(4)} HLS` : "0.00 HLS"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">HVT Balance</span>
              <span className="font-bold">{hvtBalance ? `${parseFloat(hvtBalance.formatted).toFixed(2)} HVT` : "0.00 HVT"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><ImageIcon /> NFT Collection</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-6xl font-bold">{nftBalance?.toString() || "0"}</p>
            <p className="text-muted-foreground">Digital Relics Owned</p>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/gallery">View Your Gallery</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>My Profile – Helivault Gate</title>
      </Helmet>
      <div className="space-y-16 pb-24">
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your <span className="text-primary">Dashboard</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            An overview of your assets and activity within the Helivault ecosystem.
          </motion.p>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderProfile()}
        </section>
      </div>
    </>
  );
};

export default Profile;
