function EmptyState({ icon, title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-border">
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        {icon && (
          <div
            className="mb-2 flex size-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(47,108,246,0.35)]"
            style={{ background: "var(--tf-brand-gradient)" }}
          >
            {icon}
          </div>
        )}
        <h3 className="text-lg font-extrabold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="max-w-[360px] text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action}
      </div>
    </div>
  );
}

export default EmptyState;
