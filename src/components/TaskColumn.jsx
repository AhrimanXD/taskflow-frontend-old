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
    <section>
      <h2>
        {meta.label} ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        <ul>
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
