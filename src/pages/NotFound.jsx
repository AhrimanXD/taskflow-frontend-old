import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-primary-light)]/30 to-[var(--color-surface)] px-4">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--color-primary-light)] flex items-center justify-center shadow-sm">
          <span className="text-3xl font-extrabold text-[var(--color-primary)]">
            404
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-sm shadow-[var(--color-primary)]/20"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
