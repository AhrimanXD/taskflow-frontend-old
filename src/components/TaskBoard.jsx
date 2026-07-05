import TaskColumn from "./TaskColumn";
import { groupByStatus } from "../utils/tasks";

// Kanban layout: three equal columns that stack on small screens
// (reference uses a 3-up grid rather than a horizontal scroll).
function TaskBoard({ tasks, onEdit, onDelete, onStatusChange, currentUserId, onAssignToggle, membersById }) {
  const groups = groupByStatus(tasks);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
