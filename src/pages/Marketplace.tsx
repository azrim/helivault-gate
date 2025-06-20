import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const Marketplace = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-16">
          <CardContent>
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Marketplace Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Discover, buy, and sell NFTs in our upcoming marketplace. Get
              ready for an amazing trading experience!
            </p>
            <Button>Notify Me When Ready</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Marketplace;
