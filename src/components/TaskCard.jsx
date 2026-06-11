import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Menu,
  ActionIcon,
  UnstyledButton,
  Tooltip,
} from "@mantine/core";
import { IconCalendar, IconUserCircle } from "@tabler/icons-react";
import { TASK_STATUSES, statusMeta } from "../constants/tasks";

function dueMeta(task) {
  if (!task.due_date) return null;
  const due = new Date(task.due_date);
  const overdue = due < new Date() && task.status !== "completed";
  return { label: due.toLocaleDateString(), overdue };
}

// currentUserId + onAssignToggle are only passed in workspace contexts —
// personal tasks aren't assignable, so the assign UI stays hidden there.
function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  onAssignToggle,
}) {
  const meta = statusMeta(task.status);
  const due = dueMeta(task);
  const assignedToMe =
    task.assignee_id != null && task.assignee_id === currentUserId;

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
            {onAssignToggle && (
              <Menu.Item
                onClick={() => onAssignToggle(task, assignedToMe ? null : currentUserId)}
              >
                {assignedToMe ? "Unassign me" : "Assign to me"}
              </Menu.Item>
            )}
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

        <Group gap={6}>
          {task.assignee_id != null && (
            <Tooltip
              label={assignedToMe ? "Assigned to you" : `Assigned to user #${task.assignee_id}`}
            >
              <Badge
                variant="light"
                color={assignedToMe ? "teal" : "gray"}
                leftSection={<IconUserCircle size={12} />}
              >
                {assignedToMe ? "You" : `#${task.assignee_id}`}
              </Badge>
            </Tooltip>
          )}
          {due && (
            <Tooltip label={due.overdue ? "Overdue" : "Due date"}>
              <Badge
                variant={due.overdue ? "filled" : "light"}
                color={due.overdue ? "red" : "gray"}
                leftSection={<IconCalendar size={12} />}
              >
                {due.label}
              </Badge>
            </Tooltip>
          )}
          {!due && task.assignee_id == null && (
            <Text size="xs" c="dimmed">
              {new Date(task.created_at).toLocaleDateString()}
            </Text>
          )}
        </Group>
      </Group>
    </Card>
  );
}

export default TaskCard;
