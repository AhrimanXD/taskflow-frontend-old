import { Box, Group } from "@mantine/core";
import TaskColumn from "./TaskColumn";
import { groupByStatus } from "../utils/tasks";

function TaskBoard({ tasks, onEdit, onDelete, onStatusChange, currentUserId, onAssignToggle, membersById }) {
  const groups = groupByStatus(tasks);

  return (
    <Box className="tf-scroll" style={{ overflowX: "auto" }} pb="sm">
      <Group align="flex-start" gap="lg" wrap="nowrap">
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
      </Group>
    </Box>
  );
}

export default TaskBoard;
