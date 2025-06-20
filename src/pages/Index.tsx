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
        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Helivault NFT 1 */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                <Coins className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-lg font-semibold">
                Helivault NFT 1
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center relative">
              <div className="bg-success-gradient rounded-xl p-6 text-white">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-white/80">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum.
                    </Label>
                    <div className="text-sm text-white/80 mt-2">
                      Mint Price: 0.01 HLS
                    </div>
                  </div>
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    MINT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mint History */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4 px-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Mint History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
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
