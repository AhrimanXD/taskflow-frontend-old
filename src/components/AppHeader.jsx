import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useMyInvitations } from "../hooks/useInvitations";

const NAV = [
  {
    label: "Tasks",
    to: "/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    label: "Workspaces",
    to: "/workspaces",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Invitations",
    to: "/invitations",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
      </svg>
    ),
  },
];

function AppHeader({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { data: pendingInvites = [] } = useMyInvitations("pending");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[var(--color-surface-secondary)]/80 backdrop-blur-lg border-b border-[var(--color-border)] px-4 h-14 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-lg font-extrabold text-[var(--color-text)] tracking-tight"
        >
          <span className="text-[var(--color-primary)]">Task</span>flow
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-[var(--color-overlay)]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[var(--color-surface-secondary)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 lg:translate-x-0 ${
          collapsed ? "w-16" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + collapse toggle */}
        <div className="h-16 flex items-center gap-2 px-3 border-b border-[var(--color-border)]">
          <Link
            to="/dashboard"
            className={`text-xl font-extrabold text-[var(--color-text)] tracking-tight shrink-0 ${
              collapsed ? "mx-auto" : "pl-2"
            }`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-[var(--color-primary)]">T</span>
            {!collapsed && <span>askflow</span>}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              className="ml-auto p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 cursor-pointer"
              aria-label="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute top-[18px] -right-3 z-50 w-6 h-6 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
            aria-label="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            const showBadge =
              item.to === "/invitations" && pendingInvites.length > 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  collapsed
                    ? "justify-center p-2.5"
                    : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && showBadge && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-bold rounded-full bg-[var(--color-primary)] text-white">
                    {pendingInvites.length}
                  </span>
                )}
                {collapsed && showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`px-3 py-4 border-t border-[var(--color-border)] ${collapsed ? "flex flex-col items-center" : ""}`}>
          <div className={`flex items-center ${collapsed ? "flex-col gap-1" : "gap-3 px-3 py-2"}`}>
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[var(--color-primary)]">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className={`mt-1 flex items-center rounded-xl text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-all duration-200 cursor-pointer ${
              collapsed ? "justify-center p-2.5 w-full" : "w-full gap-3 px-3 py-2.5"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
              <path fillRule="evenodd" d="M17 4.25A2.25 2.25 0 0014.75 2h-5.5A2.25 2.25 0 007 4.25v2a.75.75 0 001.5 0v-2a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v11.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-2a.75.75 0 00-1.5 0v2A2.25 2.25 0 009.25 18h5.5A2.25 2.25 0 0017 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M1 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H1.75A.75.75 0 011 10z" clipRule="evenodd" />
            </svg>
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default AppHeader;