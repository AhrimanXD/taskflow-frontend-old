import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import TaskCard from "./TaskCard";
import { statusMeta } from "../constants/tasks";

function TaskColumn({ status, tasks, onEdit, onDelete, onStatusChange }) {
  const meta = statusMeta(status);

  return (
    <Stack
      gap="sm"
      style={{ minWidth: 300, flex: "1 0 300px", maxWidth: 380 }}
    >
      <Group gap="xs" px={4}>
        <Badge color={meta.color} variant="light" radius="sm">
          {meta.label}
        </Badge>
        <Text size="sm" c="dimmed" fw={500}>
          {tasks.length}
        </Text>
      </Group>

      <Stack gap="sm">
        {tasks.length === 0 ? (
          <Paper
            withBorder
            radius="md"
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
            />
          ))
        )}
      </Stack>
    </Stack>
  );
}

export default TaskColumn;
