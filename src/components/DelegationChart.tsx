import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Frown } from "lucide-react";

const DelegationChart = () => {
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center space-y-0 pb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
          <PieChart className="w-5 h-5 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold">
          NFT Collection Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              NFT Collection Distribution
            </h3>
            <div className="w-32 h-32 mx-auto bg-secondary/30 rounded-full flex items-center justify-center">
              <Frown className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">No NFTs found</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DelegationChart;
