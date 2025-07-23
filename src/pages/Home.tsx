// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Sparkles, Flame, Droplets, Gallery, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/Home.css";

const FeatureCard = ({ icon, title, description, link }) => (
  <motion.div
    className="feature-card w-full"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Link to={link} className="block p-8 rounded-lg bg-card h-full">
      <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-secondary">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Link>
  </motion.div>
);

const Home = () => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="text-center pt-24 pb-16">
        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to the
          <br />
          <span className="text-primary">Helivault Gate</span>
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Your portal to the decentralized ecosystem on Helios.
          Engage with our dApps, win prizes, and mint unique NFTs.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Button asChild size="lg">
            <Link to="/lottery">
              Play Lottery <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/mint">Mint an NFT</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="home-grid">
          <FeatureCard
            icon={<Ticket className="h-8 w-8 text-primary" />}
            title="HLS Lottery"
            description="Test your luck and win HLS prizes in our decentralized lottery. Every spin is a chance to win!"
            link="/lottery"
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-primary" />}
            title="Mint NFTs"
            description="Become a creator and mint your own unique digital assets on the Helios blockchain."
            link="/mint"
          />
          <FeatureCard
            icon={<Flame className="h-8 w-8 text-primary" />}
            title="Daily Check-in"
            description="Check in every day to build your streak and earn rewards for your consistency."
            link="/checkin"
          />
          <FeatureCard
            icon={<Droplets className="h-8 w-8 text-primary" />}
            title="HVT Faucet"
            description="Get free HVT tokens to test and interact with the Helivault ecosystem."
            link="/faucet"
          />
          <FeatureCard
            icon={<Gallery className="h-8 w-8 text-primary" />}
            title="NFT Gallery"
            description="View your collection of minted Helivault NFTs in our dedicated gallery."
            link="/gallery"
          />
          <FeatureCard
            icon={<Rocket className="h-8 w-8 text-primary" />}
            title="Deploy Contracts"
            description="A simple interface for deploying and managing your smart contracts on the Helios testnet."
            link="/deploy"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">About Helivault Gate</h2>
        <p className="text-muted-foreground">
          Helivault Gate is a community-focused platform designed to showcase the power and flexibility of the Helios blockchain. Our goal is to provide a suite of useful and engaging dApps that make it easy for users to explore the world of decentralized applications. Whether you're a developer, an NFT collector, or just curious about crypto, Helivault Gate is your entry point to the future of the decentralized web.
        </p>
      </section>
    </div>
  );
};

export default Home;
