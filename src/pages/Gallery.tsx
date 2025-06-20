import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Image,
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  ExternalLink,
} from "lucide-react";
import Navigation from "@/components/Navigation";

const Gallery = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Gallery</h1>
            <p className="text-muted-foreground">
              Discover and manage your NFT collection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button variant="ghost" size="sm">
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your collection..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-muted-foreground">Total NFTs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">Collections</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">2.4 ETH</div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">0.15 ETH</div>
              <p className="text-sm text-muted-foreground">Avg. Floor</p>
            </CardContent>
          </Card>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold truncate">
                      Cosmic Warrior #{i}
                    </h3>
                    <Badge variant="secondary" className="text-xs ml-2">
                      #{i}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cosmic Collection
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Floor Price
                      </p>
                      <p className="font-semibold">0.15 ETH</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for when no NFTs */}
        <Card className="mt-8 text-center py-12">
          <CardContent>
            <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Your gallery is empty
            </h3>
            <p className="text-muted-foreground mb-4">
              Start minting NFTs to build your collection
            </p>
            <Button>Create Your First NFT</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Gallery;
