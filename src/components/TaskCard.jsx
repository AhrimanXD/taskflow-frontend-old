import { TASK_STATUSES, statusMeta } from "../constants/tasks";

function dueMeta(task) {
  if (!task.due_date) return null;
  const due = new Date(task.due_date);
  const overdue = due < new Date() && task.status !== "completed";
  return { label: due.toLocaleDateString(), overdue };
}

// currentUserId + onAssignToggle are only passed in workspace contexts —
// personal tasks aren't assignable, so the assign UI stays hidden there.
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
  const assignedToMe =
    task.assignee_id != null && task.assignee_id === currentUserId;
  // Resolve the assignee's username from the workspace members (when available).
  const assignee =
    task.assignee_id != null ? membersById?.[task.assignee_id] : null;
  const assigneeLabel = assignedToMe
    ? "You"
    : assignee?.username ?? `#${task.assignee_id}`;

  return (
    <article className="border border-border rounded-lg p-4 bg-background hover:shadow-sm transition-shadow">
      <div className="mb-3">
        <h3 className="text-base font-semibold mb-1">{task.title}</h3>
        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <select
            aria-label="Set status"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.currentTarget.value)}
            className="text-sm px-2 py-1 border border-border rounded bg-muted text-foreground"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {due && (
          <div>
            <span className="text-muted-foreground">Due:</span> {due.label}
            {due.overdue && <span className="text-error ml-2">(overdue)</span>}
          </div>
        )}

        {task.assignee_id != null && (
          <div>
            <span className="text-muted-foreground">Assigned to:</span> {assigneeLabel}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button 
          type="button" 
          onClick={() => onEdit(task)}
          className="text-sm px-3 py-1 rounded bg-muted hover:bg-accent hover:text-accent-foreground text-foreground transition-colors"
        >
          Edit
        </button>
        {onAssignToggle && (
          <button
            type="button"
            onClick={() => onAssignToggle(task, assignedToMe ? null : currentUserId)}
            className="text-sm px-3 py-1 rounded bg-muted hover:bg-accent hover:text-accent-foreground text-foreground transition-colors"
          >
            {assignedToMe ? "Unassign me" : "Assign to me"}
          </button>
        )}
        <button 
          type="button" 
          onClick={() => onDelete(task)}
          className="text-sm px-3 py-1 rounded bg-muted hover:bg-error hover:text-white text-foreground transition-colors ml-auto"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
