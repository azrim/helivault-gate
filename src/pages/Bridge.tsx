import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Bridge = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Bridge – Helivault Gate</title>
      </Helmet>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Token Bridge</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ArrowLeftRight className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bridge Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Bridge your tokens to Sepolia, BSC Testnet, and Fuji. This feature is currently under construction.
            </p>
            <Button disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Bridge;