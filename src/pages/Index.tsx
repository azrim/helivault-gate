import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Coins, Zap, Star, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import DelegationChart from "@/components/DelegationChart";

const Index = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* My Collection Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">
                My NFT Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Total Portfolio Value
                  </Label>
                  <div className="text-2xl font-bold">$3.2k</div>
                  <div className="text-xs text-muted-foreground">
                    Across 5 collections
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-success">Average Growth</Label>
                  <div className="text-2xl font-bold text-success">
                    5934.80%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Weighted average
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Minting Rewards */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                <Coins className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-lg font-semibold">
                My Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center relative">
              <div className="bg-success-gradient rounded-xl p-6 text-white">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-white/80">
                      Rewards Available
                    </Label>
                    <div className="text-4xl font-bold mt-2 flex items-baseline justify-center gap-2">
                      19.98
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white/80">≈$1500</div>
                  </div>
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Claim All Rewards ⚡
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active NFT Minting */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Active NFT Minting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-4 px-4 rounded-l-lg font-medium text-sm text-muted-foreground">
                      NFT Collection
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground">
                      Minted Assets
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-sm text-muted-foreground">
                      Rarity Rate
                    </th>
                    <th className="text-right py-4 px-4 rounded-r-lg font-medium text-sm text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>{/* Empty table body for now */}</tbody>
              </table>
            </div>

            <div className="mt-8 bg-secondary/30 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-base font-semibold text-foreground">
                  NFT Minting Information
                </div>
                <div className="text-sm text-muted-foreground">
                  No active minting session found.
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
