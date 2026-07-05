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
    <article>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}

      <p>
        Status: {meta.label}{" "}
        <select
          aria-label="Set status"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.currentTarget.value)}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </p>

      {due && (
        <p>
          Due: {due.label}
          {due.overdue ? " (overdue)" : ""}
        </p>
      )}

      {task.assignee_id != null && <p>Assigned to: {assigneeLabel}</p>}

      <button type="button" onClick={() => onEdit(task)}>
        Edit
      </button>
      {onAssignToggle && (
        <button
          type="button"
          onClick={() => onAssignToggle(task, assignedToMe ? null : currentUserId)}
        >
          {assignedToMe ? "Unassign me" : "Assign to me"}
        </button>
      )}
      <button type="button" onClick={() => onDelete(task)}>
        Delete
      </button>
    </article>
  );
}

export default TaskCard;
