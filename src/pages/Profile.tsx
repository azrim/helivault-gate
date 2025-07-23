// src/pages/Profile.tsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

const Profile = () => {
  const { address, isConnected } = useAccount();

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
            View your account details and manage your presence in the Helivault ecosystem.
          </motion.p>
        </section>

        {/* Profile Section */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                This is your public profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              {isConnected ? (
                <div className="space-y-6">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${address}`} alt="User Avatar" />
                    <AvatarFallback>{address?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="break-all">
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <p className="font-mono">{address}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                  <p className="text-muted-foreground">Please connect your wallet to view your profile.</p>
                  <ConnectButton />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default Profile;