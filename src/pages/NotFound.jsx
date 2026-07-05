import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-6xl font-bold text-muted mb-4">404</div>
          <h1 className="text-3xl font-bold mb-3">Page not found</h1>
          <p className="text-muted-foreground mb-8">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        </div>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center bg-accent text-accent-foreground font-medium px-6 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
