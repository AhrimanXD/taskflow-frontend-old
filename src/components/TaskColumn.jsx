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

  return (
    <section className="flex-1 min-w-0">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {meta.label} <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span>
        </h2>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tasks</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                currentUserId={currentUserId}
                onAssignToggle={onAssignToggle}
                membersById={membersById}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskColumn;
