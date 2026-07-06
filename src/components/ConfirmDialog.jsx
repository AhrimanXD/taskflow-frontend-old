function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-overlay)] backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-label={title}
        className="w-full max-w-sm bg-[var(--color-surface-secondary)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-light)] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--color-danger)]">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {description}
        </p>
        <div className="mt-6 flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-danger)] text-white text-sm font-semibold hover:bg-[var(--color-danger-hover)] transition-all duration-200 cursor-pointer shadow-sm shadow-[var(--color-danger)]/20"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
