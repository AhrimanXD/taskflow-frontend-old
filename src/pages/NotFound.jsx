import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <p className="text-[64px] font-extrabold leading-none text-primary">404</p>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="max-w-[340px] text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Button asChild className="mt-3">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
