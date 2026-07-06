function TaskSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((col) => (
        <div key={col} className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 shadow-sm">
          <div className="h-5 w-20 rounded-lg bg-[var(--color-surface-hover)] animate-pulse mb-5" />
          <div className="space-y-3">
            {[1, 2].map((card) => (
              <div
                key={card}
                className="rounded-xl border border-[var(--color-border)] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-4 w-3/4 bg-[var(--color-surface-hover)] rounded animate-pulse" />
                  <div className="h-5 w-16 bg-[var(--color-surface-hover)] rounded-full animate-pulse shrink-0" />
                </div>
                <div className="h-3 w-full bg-[var(--color-surface-hover)] rounded animate-pulse" />
                <div className="pt-3 border-t border-[var(--color-border)]">
                  <div className="h-8 w-full bg-[var(--color-surface-hover)] rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskSkeleton;
