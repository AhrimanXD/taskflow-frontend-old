import AppHeader from "./AppHeader";

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="tf-page mx-auto w-full max-w-[1140px] px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}

export default PageShell;
