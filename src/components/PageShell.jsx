import { useState } from "react";
import AppHeader from "./AppHeader";

function PageShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-surface)]">
      <AppHeader
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <main
        className={`flex-1 min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default PageShell;