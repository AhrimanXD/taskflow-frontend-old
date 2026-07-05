import TaskColumn from "./TaskColumn";
import { groupByStatus } from "../utils/tasks";

function TaskBoard({ tasks, onEdit, onDelete, onStatusChange, currentUserId, onAssignToggle, membersById }) {
  const groups = groupByStatus(tasks);

  return (
    <div>
      {[...groups.entries()].map(([status, columnTasks]) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={columnTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          currentUserId={currentUserId}
          onAssignToggle={onAssignToggle}
          membersById={membersById}
        />
      ))}
    </div>
  );
}

export default TaskBoard;
