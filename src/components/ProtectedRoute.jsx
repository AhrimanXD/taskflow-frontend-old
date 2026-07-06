import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
          <p className="text-sm text-[var(--color-text-tertiary)] font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
