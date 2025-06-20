import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Coins, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import DelegationChart from "@/components/DelegationChart";

const Index = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main NFT Mint Card */}
        <Card className="bg-card border-border mb-8">
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

        {/* Mint History */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Mint History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-4 px-4 rounded-l-lg font-medium text-sm text-muted-foreground">
                      NFT
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground">
                      Price
                    </th>
                    <th className="text-right py-4 px-4 rounded-r-lg font-medium text-sm text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample mint history entries */}
                  <tr className="border-b border-border last:border-0">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded"></div>
                        <span className="font-medium">Helivault NFT #001</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      2 hours ago
                    </td>
                    <td className="py-4 px-4 font-medium">0.01 HLS</td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
                        Minted
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-secondary/30 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-base font-semibold text-foreground">
                  Ready to mint your first NFT?
                </div>
                <div className="text-sm text-muted-foreground">
                  Start minting to see your transaction history here.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delegation Distribution Chart */}
        <DelegationChart />
      </main>
    </div>
  );
};

export default Index;
