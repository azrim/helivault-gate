// src/pages/Profile.tsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Flame, Sparkles, Coins } from "lucide-react";
import { HELIVAULT_TOKEN_CONTRACT } from "@/contracts/HelivaultToken";
import { HELIVAULT_COLLECTIONS_CONTRACT } from "@/contracts/HelivaultCollections";
import { DAILY_CHECK_IN_CONTRACT } from "@/contracts/DailyCheckIn";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatEther } from "viem";

const StatCard = ({ icon, title, value, link, linkText }) => (
  <div className="bg-secondary p-6 rounded-lg text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <p className="text-3xl font-bold mb-4">{value}</p>
    <Button asChild variant="outline" size="sm">
      <Link to={link}>{linkText}</Link>
    </Button>
  </div>
);

const Profile = () => {
  const { address, isConnected } = useAccount();

  // --- Data Fetching ---
  const { data: hvtBalance } = useBalance({
    address: address,
    token: HELIVAULT_TOKEN_CONTRACT.address,
    query: { enabled: isConnected },
  });

  const { data: nftBalance } = useReadContract({
    ...HELIVAULT_COLLECTIONS_CONTRACT,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected },
  });

  const { data: streak } = useReadContract({
    ...DAILY_CHECK_IN_CONTRACT,
    functionName: "getStreak",
    args: [address!],
    query: { enabled: isConnected },
  });

  return (
    <>
      <Helmet>
        <title>My Profile – Helivault Gate</title>
      </Helmet>
      <div className="space-y-16 pb-24">
        {/* Header */}
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your <span className="text-primary">Profile</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            View your assets and activity across the Helivault ecosystem.
          </motion.p>
        </section>

        {/* Profile Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isConnected ? (
            <Card className="py-16">
              <CardContent className="text-center space-y-4">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">Please connect your wallet to view your profile.</p>
                <ConnectButton />
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: User Info */}
              <Card className="lg:col-span-1">
                <CardHeader className="items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${address}`} alt="User Avatar" />
                    <AvatarFallback>{address?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <CardTitle>Your Wallet</CardTitle>
                  <CardDescription className="font-mono break-all">{address}</CardDescription>
                </CardHeader>
              </Card>

              {/* Right Column: Stats */}
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
                <StatCard
                  icon={<Coins className="h-8 w-8 text-primary" />}
                  title="HVT Balance"
                  value={hvtBalance ? `${parseFloat(hvtBalance.formatted).toFixed(2)}` : "0"}
                  link="/faucet"
                  linkText="Get HVT"
                />
                <StatCard
                  icon={<Sparkles className="h-8 w-8 text-primary" />}
                  title="NFTs Owned"
                  value={nftBalance?.toString() || "0"}
                  link="/gallery"
                  linkText="View Gallery"
                />
                <StatCard
                  icon={<Flame className="h-8 w-8 text-primary" />}
                  title="Check-in Streak"
                  value={streak?.toString() || "0"}
                  link="/checkin"
                  linkText="Check In"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Profile;
