import AppHeader from "./AppHeader";

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}

export default PageShell;
