// src/pages/Home.tsx
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Droplets, Image } from "lucide-react";
import { motion } from "framer-motion";
import WalletStatus from "@/components/WalletStatus";
import { useAccount } from "wagmi";
import "../styles/Home.css"; // Import the new CSS file

const FeatureCard = ({ icon, title, description, link }) => (
  <motion.div whileHover={{ y: -5, scale: 1.02 }} className="h-full">
    <Link to={link} className="block h-full">
      <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const Home = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-b-3xl"
      >
        <div className="absolute inset-0 gradient-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            Welcome to Helivault Gate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/80"
          >
            Your portal to the decentralized world of NFTs. Mint, collect, and trade unique digital assets on the Helios blockchain.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="mt-8"
          >
            <Button
              size="lg"
              variant="hero"
              onClick={() => navigate('/mint')}
            >
              Start Minting <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What We Offer</h2>
            <p className="text-muted-foreground mt-2">Explore the core features of the Helivault Gate.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="Mint NFTs"
              description="Create your own unique digital assets on the Helios blockchain."
              link="/mint"
            />
            <FeatureCard
              icon={<Image className="h-8 w-8 text-primary" />}
              title="Explore Your Gallery"
              description="View and manage your entire NFT collection in one place."
              link="/gallery"
            />
            <FeatureCard
              icon={<Droplets className="h-8 w-8 text-primary" />}
              title="Get Free Tokens"
              description="Use our faucet to get free HLS tokens for testing and minting."
              link="/faucet"
            />
          </div>
        </section>

        {/* Wallet Status Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Wallet Status</h2>
            <p className="text-muted-foreground mt-2">Check your connection status and balance.</p>
          </div>
          <div className="max-w-md mx-auto">
            <WalletStatus />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;