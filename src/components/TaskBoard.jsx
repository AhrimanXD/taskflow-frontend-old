import TaskColumn from "./TaskColumn";
import { groupByStatus } from "../utils/tasks";

function TaskBoard({ tasks, onEdit, onDelete, onStatusChange, currentUserId, onAssignToggle, membersById }) {
  const groups = groupByStatus(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
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
