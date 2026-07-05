import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div>
      <h1>404 — Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/dashboard">Back to dashboard</Link>
    </div>
  );
}

export default NotFound;
