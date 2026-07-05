import AppHeader from "./AppHeader";

function PageShell({ children }) {
  return (
    <div>
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}

export default PageShell;
