import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <div>
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-16">
          <CardContent>
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile Dashboard</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Manage your profile, track your activity, and customize your NFT
              experience. Coming soon with advanced features!
            </p>
            <Button>Connect Wallet to Continue</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
