function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-7 h-7 text-[var(--color-primary)]"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
