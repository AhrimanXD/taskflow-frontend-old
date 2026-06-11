import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import TaskCard from "./TaskCard";
import { statusMeta } from "../constants/tasks";

function TaskColumn({ status, tasks, onEdit, onDelete, onStatusChange, currentUserId, onAssignToggle }) {
  const meta = statusMeta(status);

  return (
    <Stack
      gap="sm"
      className="tf-column"
      style={{ minWidth: 300, flex: "1 0 300px", maxWidth: 380 }}
    >
      <Group gap={8} px={6} pt={2}>
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: `var(--mantine-color-${meta.color}-5)`,
          }}
        />
        <Text size="sm" fw={600}>
          {meta.label}
        </Text>
        <Text size="sm" c="dimmed" fw={500}>
          {tasks.length}
        </Text>
      </Group>

      <Stack gap="sm">
        {tasks.length === 0 ? (
          <Paper
            withBorder
            p="md"
            style={{ borderStyle: "dashed", background: "transparent" }}
          >
            <Text size="sm" c="dimmed" ta="center">
              No tasks
            </Text>
          </Paper>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              currentUserId={currentUserId}
              onAssignToggle={onAssignToggle}
            />
          ))
        )}
      </Stack>
    </Stack>
  );
}

export default TaskColumn;
