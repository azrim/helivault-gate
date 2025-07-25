// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Page from "@/components/Page";

const NotFound = () => {
  return (
    <Page
      title="404 Not Found"
      description="Oops! The page you're looking for doesn't exist."
    >
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
        <AlertTriangle className="h-24 w-24 text-primary mb-6" />
        <h1 className="text-6xl font-bold tracking-tighter">404</h1>
        <p className="text-2xl font-medium text-muted-foreground mt-2">
          Page Not Found
        </p>
        <p className="max-w-md mx-auto mt-4 text-muted-foreground">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </Page>
  );
};

export default NotFound;
