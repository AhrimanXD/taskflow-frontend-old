import TaskCard from "./TaskCard";
import { statusMeta } from "../constants/tasks";

function TaskColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  onAssignToggle,
  membersById,
}) {
  const meta = statusMeta(status);

  const headerStyle = {
    pending: "bg-[var(--color-pending-light)] text-[var(--color-pending)]",
    ongoing: "bg-[var(--color-ongoing-light)] text-[var(--color-ongoing)]",
    completed: "bg-[var(--color-completed-light)] text-[var(--color-completed)]",
  };

  const dotStyle = {
    pending: "bg-[var(--color-pending)]",
    ongoing: "bg-[var(--color-ongoing)]",
    completed: "bg-[var(--color-completed)]",
  };

  return (
    <section className="bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotStyle[status] ?? "bg-gray-400"}`} />
        <h2
          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
            headerStyle[status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {meta.label}
        </h2>
        <span className="text-xs font-semibold text-[var(--color-text-tertiary)] ml-auto">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-[var(--color-text-tertiary)]">No tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              currentUserId={currentUserId}
              onAssignToggle={onAssignToggle}
              membersById={membersById}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TaskColumn;
