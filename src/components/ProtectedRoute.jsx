import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth();

  if (loading) {
    return <p>Loading…</p>;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
