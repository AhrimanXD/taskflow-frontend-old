import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useMyInvitations } from "../hooks/useInvitations";

const NAV = [
  { label: "Tasks", to: "/dashboard" },
  { label: "Workspaces", to: "/workspaces" },
  { label: "Invitations", to: "/invitations" },
];

function AppHeader() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { data: pendingInvites = [] } = useMyInvitations("pending");

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/dashboard" className="text-xl font-bold text-foreground hover:opacity-80">
            Taskflow
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6 flex-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              const showBadge =
                item.to === "/invitations" && pendingInvites.length > 0;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {showBadge && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent text-accent-foreground rounded-full">
                      {pendingInvites.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">{user?.username}</div>
              <div className="text-xs">{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
