import { TASK_STATUSES, statusMeta } from "../constants/tasks";
import { Clock, User } from "lucide-react";

function dueMeta(task) {
  if (!task.due_date) return null;
  const due = new Date(task.due_date);
  const overdue = due < new Date() && task.status !== "completed";
  return { label: due.toLocaleDateString(), overdue };
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  onAssignToggle,
  membersById,
}) {
  const meta = statusMeta(task.status);
  const due = dueMeta(task);
  const assignedToMe = task.assignee_id != null && task.assignee_id === currentUserId;
  const assignee = task.assignee_id != null ? membersById?.[task.assignee_id] : null;
  const assigneeLabel = assignedToMe ? "You" : assignee?.username ?? `#${task.assignee_id}`;

  const statusBadge = {
    pending: "bg-[var(--color-pending-light)] text-[var(--color-pending)] ring-1 ring-[var(--color-pending)]/20",
    ongoing: "bg-[var(--color-ongoing-light)] text-[var(--color-ongoing)] ring-1 ring-[var(--color-ongoing)]/20",
    completed: "bg-[var(--color-completed-light)] text-[var(--color-completed)] ring-1 ring-[var(--color-completed)]/20",
  };

  return (
    <article className="group bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)] p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">{task.title}</h3>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            statusBadge[task.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {meta.label}
        </span>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
        {due && (
          <span className={`inline-flex items-center gap-1 ${due.overdue ? "text-[var(--color-danger)] font-semibold" : ""}`}>
            <Clock className="w-3.5 h-3.5" />
            {due.label}
            {due.overdue && " (overdue)"}
          </span>
        )}
        {task.assignee_id != null && (
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {assigneeLabel}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-2">
        <select
          aria-label="Set status"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.currentTarget.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 cursor-pointer"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 cursor-pointer"
        >
          Edit
        </button>

        {onAssignToggle && (
          <button
            type="button"
            onClick={() => onAssignToggle(task, assignedToMe ? null : currentUserId)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 cursor-pointer"
          >
            {assignedToMe ? "Unassign" : "Assign me"}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(task)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-all duration-200 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
