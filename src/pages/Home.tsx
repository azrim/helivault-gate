// src/pages/Home.tsx
import Navigation from "@/components/Navigation";
import WalletStatus from "@/components/WalletStatus";
import { Helmet } from "react-helmet-async";
import PageWrapper from "@/components/PageWrapper";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Home – Helivault Gate</title>
      </Helmet>
      <Navigation />
      <PageWrapper>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-4">
              Welcome to Helivault
            </h1>
            <p className="text-muted-foreground text-lg">
              Your gateway to the digital cosmos
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <WalletStatus />
          </div>
        </main>
      </PageWrapper>
    </div>
  );
};

export default Home;