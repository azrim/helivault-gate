import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import Navigation from "@/components/Navigation";

const Mint = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main NFT Mint Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* NFT Image */}
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-80"></div>
                <div className="relative z-10 text-center text-white">
                  <div className="text-6xl font-bold mb-2">#001</div>
                  <div className="text-lg">Helivault NFT</div>
                </div>
              </div>

              {/* Mint Interface */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Helivault NFT #001
                  </h1>
                  <div className="text-sm text-muted-foreground mb-4">
                    Collection: Genesis Series
                  </div>
                </div>

                {/* Lore */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Lore</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Born from the cosmic storms of the Helivault dimension, this
                    NFT carries the ancient power of digital creation. Each
                    piece holds unique properties that unlock special abilities
                    within the metaverse, making it not just art, but a key to
                    infinite possibilities.
                  </p>
                </div>

                {/* Mint Price & Stats */}
                <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Mint Price
                    </span>
                    <span className="text-lg font-bold">0.01 HLS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Supply
                    </span>
                    <span className="font-medium">500 / 1000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Rarity
                    </span>
                    <span className="font-medium text-success">Epic</span>
                  </div>
                </div>

                {/* Mint Button */}
                <Button className="w-full h-12 text-lg bg-brand-gradient hover:opacity-90 transition-opacity">
                  <Zap className="w-5 h-5 mr-2" />
                  Mint NFT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Mint;
