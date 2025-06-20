import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Palette,
  Coins,
  TrendingUp,
  Image,
  Upload,
  Zap,
  Star,
  Award,
  Activity,
} from "lucide-react";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [mintProgress, setMintProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleMint = () => {
    setMintProgress(25);
    setTimeout(() => setMintProgress(50), 1000);
    setTimeout(() => setMintProgress(75), 2000);
    setTimeout(() => setMintProgress(100), 3000);
  };

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
                My Delegations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Total Staked Value
                  </Label>
                  <div className="text-2xl font-bold">$3.2k</div>
                  <div className="text-xs text-muted-foreground">
                    Across 5 validators
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-success">Average APY</Label>
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

        {/* Main Minting Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center space-y-0 pb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Create New NFT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="artwork">Artwork</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-sm text-muted-foreground mb-2">
                      Drop your file here, or{" "}
                      <span className="text-primary cursor-pointer">
                        browse
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, GIF, SVG, MP4. Max 100MB.
                    </div>
                    <Input
                      id="artwork"
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter NFT name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collection">Collection</Label>
                    <Input id="collection" placeholder="Collection name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="royalty">Royalty (%)</Label>
                    <Input id="royalty" type="number" placeholder="5" />
                  </div>
                </div>
              </div>

              {/* Preview & Actions */}
              <div className="space-y-6">
                <div className="bg-secondary/30 rounded-lg p-6 text-center">
                  <Image className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                  <div className="text-sm text-muted-foreground">
                    Preview will appear here
                  </div>
                </div>

                {mintProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Minting Progress</span>
                      <span>{mintProgress}%</span>
                    </div>
                    <Progress value={mintProgress} className="h-2" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Minting Fee</span>
                      <span className="font-semibold">0.01 ETH</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Gas Fee (Est.)</span>
                      <span className="font-semibold">0.003 ETH</span>
                    </div>
                    <hr className="my-2 border-border" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">0.013 ETH</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg"
                    onClick={handleMint}
                    disabled={mintProgress > 0 && mintProgress < 100}
                  >
                    {mintProgress === 0 && "Mint NFT"}
                    {mintProgress > 0 && mintProgress < 100 && "Minting..."}
                    {mintProgress === 100 && "Minted Successfully!"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/30 rounded-lg">
                    <th className="text-left py-3 px-4 rounded-l-lg">NFT</th>
                    <th className="text-left py-3 px-4">Collection</th>
                    <th className="text-left py-3 px-4">Action</th>
                    <th className="text-right py-3 px-4 rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border last:border-0">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg"></div>
                        <span className="font-medium">
                          Cosmic Warrior #1234
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">Cosmic Collection</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success"
                      >
                        Minted
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right text-muted-foreground">
                      2 hours ago
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-secondary/30 rounded-lg p-6 text-center">
              <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">
                Start minting to see your activity here
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
