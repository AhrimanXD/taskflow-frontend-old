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
    <header>
      <Link to="/dashboard">Taskflow</Link>
      <nav>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.to);
          const showBadge =
            item.to === "/invitations" && pendingInvites.length > 0;
          return (
            <Link key={item.to} to={item.to} aria-current={active ? "page" : undefined}>
              {item.label}
              {showBadge && <span> ({pendingInvites.length})</span>}
            </Link>
          );
        })}
      </nav>
      <span>
        {user?.username} ({user?.email}){" "}
        <button type="button" onClick={logout}>
          Log out
        </button>
      </span>
    </header>
  );
}

export default AppHeader;
