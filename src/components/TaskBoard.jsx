import { SimpleGrid } from "@mantine/core";
import TaskColumn from "./TaskColumn";
import { groupByStatus } from "../utils/tasks";

// Kanban layout: three equal columns that stack on small screens
// (reference uses a 3-up grid rather than a horizontal scroll).
function TaskBoard({ tasks, onEdit, onDelete, onStatusChange, currentUserId, onAssignToggle, membersById }) {
  const groups = groupByStatus(tasks);

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" verticalSpacing="lg">
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
    </SimpleGrid>
  );
}

export default TaskBoard;
