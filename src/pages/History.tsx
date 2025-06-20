import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAccount } from "wagmi";
import { useNFTMintHistory } from "@/hooks/useNFTMintHistory";

const History = () => {
  const { address } = useAccount();
  const { tokenIds, loading } = useNFTMintHistory(address);

  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  {loading ? (
                    <tr>
                      <td className="py-4 px-4" colSpan={4}>
                        Loading...
                      </td>
                    </tr>
                  ) : tokenIds.length === 0 ? (
                    <tr>
                      <td className="py-4 px-4" colSpan={4}>
                        No NFTs found.
                      </td>
                    </tr>
                  ) : (
                    tokenIds.map((id, index) => (
                      <tr key={id} className="border-b border-border last:border-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded ${
                                index % 2 === 0
                                  ? "bg-gradient-to-br from-purple-400 to-blue-400"
                                  : "bg-gradient-to-br from-pink-400 to-purple-400"
                              }`}
                            ></div>
                            <span className="font-medium">Helivault NFT #{id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">–</td>
                        <td className="py-4 px-4 font-medium">0.01 HLS</td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
                            Minted
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-secondary/30 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-base font-semibold text-foreground">
                  Ready to mint more NFTs?
                </div>
                <div className="text-sm text-muted-foreground">
                  Visit the mint page to continue building your collection.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
