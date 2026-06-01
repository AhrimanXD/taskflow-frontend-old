import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Menu,
  ActionIcon,
  UnstyledButton,
} from "@mantine/core";
import { TASK_STATUSES, statusMeta } from "../constants/tasks";

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const meta = statusMeta(task.status);

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} lineClamp={1}>
            {task.title}
          </Text>
          {task.description && (
            <Text c="dimmed" size="sm" lineClamp={2}>
              {task.description}
            </Text>
          )}
        </Stack>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label="Task actions">
              ⋯
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onEdit(task)}>Edit</Menu.Item>
            <Menu.Item color="red" onClick={() => onDelete(task)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group justify="space-between" mt="md">
        <Menu position="bottom-start" withinPortal>
          <Menu.Target>
            <UnstyledButton>
              <Badge color={meta.color} variant="light" style={{ cursor: "pointer" }}>
                {meta.label}
              </Badge>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Set status</Menu.Label>
            {TASK_STATUSES.map((s) => (
              <Menu.Item key={s.value} onClick={() => onStatusChange(task, s.value)}>
                {s.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <Text size="xs" c="dimmed">
          {new Date(task.created_at).toLocaleDateString()}
        </Text>
      </Group>
    </Card>
  );
}

export default TaskCard;
