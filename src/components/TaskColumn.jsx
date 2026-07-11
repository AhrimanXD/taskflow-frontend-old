import TaskCard from "./TaskCard";
import { statusMeta } from "../constants/tasks";

// Per-status accents: the count pill and the tray tint behind the cards.
const COLUMN_STYLE = {
  pending: {
    pill: "var(--tf-surface-2)",
    pillText: "var(--tf-text-2)",
    tray: "var(--tf-tray)",
    accent: false,
  },
  ongoing: {
    // Solid-blue count pill + a thin top accent strip mark in-flight work.
    pill: "var(--tf-primary)",
    pillText: "#fff",
    tray: "var(--tf-tray-active)",
    accent: true,
  },
  completed: {
    pill: "var(--tf-done-bg)",
    pillText: "var(--tf-done-text)",
    tray: "var(--tf-tray)",
    accent: false,
  },
};

function TaskColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onOpen,
  currentUserId,
  onAssignToggle,
  membersById,
}) {
  const meta = statusMeta(status);
  const accent = COLUMN_STYLE[status] ?? COLUMN_STYLE.pending;

  return (
    <div className="flex flex-col gap-3">
      {/* Header sits above the tray (reference layout) */}
      <div className="flex flex-nowrap items-center gap-2 px-1">
        <p className="text-lg font-bold tracking-[-0.01em] text-foreground">
          {meta.label}
        </p>
        <span
          className="tf-mono grid h-6 min-w-6 place-items-center rounded-full px-[7px] text-[11px] font-bold"
          style={{ background: accent.pill, color: accent.pillText }}
        >
          {tasks.length}
        </span>
      </div>

      <div
        className="relative min-h-[480px] overflow-hidden rounded-[18px] p-3.5"
        style={{ background: accent.tray }}
      >
        {accent.accent && (
          <div
            className="absolute inset-x-0 top-0 h-[5px]"
            style={{ background: "var(--tf-accent-soft)" }}
          />
        )}
        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No tasks
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onOpen={onOpen}
                currentUserId={currentUserId}
                onAssignToggle={onAssignToggle}
                membersById={membersById}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskColumn;
