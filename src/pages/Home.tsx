import Navigation from "@/components/Navigation";

const Home = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-96 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-4">
              Welcome to Helivault
            </h1>
            <p className="text-muted-foreground text-lg">
              Your gateway to the digital cosmos
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
