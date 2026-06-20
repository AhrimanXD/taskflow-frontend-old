import {
  Card,
  Box,
  Group,
  Stack,
  Text,
  Menu,
  ActionIcon,
  UnstyledButton,
  Tooltip,
  Avatar,
} from "@mantine/core";
import {
  IconCalendar,
  IconDots,
  IconChevronDown,
} from "@tabler/icons-react";
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
  membersById,
}) {
  const meta = statusMeta(task.status);
  const due = dueMeta(task);
  const assignedToMe =
    task.assignee_id != null && task.assignee_id === currentUserId;
  // Resolve the assignee's username from the workspace members (when available).
  const assignee =
    task.assignee_id != null ? membersById?.[task.assignee_id] : null;
  const assigneeLabel = assignedToMe
    ? "You"
    : assignee?.username ?? `#${task.assignee_id}`;
  const hasFooter = due || task.assignee_id != null;

  return (
    <Card withBorder radius="lg" padding="md" className="tf-card">
      {/* status (clickable) + actions */}
      <Group justify="space-between" align="center" wrap="nowrap" mb={8}>
        <Menu position="bottom-start" withinPortal>
          <Menu.Target>
            <UnstyledButton>
              <Group gap={7} wrap="nowrap">
                <Box
                  w={8}
                  h={8}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: `var(--mantine-color-${meta.color}-6)`,
                  }}
                />
                <Text fz={11} fw={700} c="dimmed" tt="uppercase" className="tf-mono">
                  {meta.label}
                </Text>
                <IconChevronDown size={12} stroke={2.5} color="var(--tf-text-3)" />
              </Group>
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

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Task actions">
              <IconDots size={16} />
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

      <Stack gap={4}>
        <Text fw={600} fz={14} lineClamp={2} style={{ lineHeight: 1.35 }}>
          {task.title}
        </Text>
        {task.description && (
          <Text c="dimmed" size="sm" lineClamp={2}>
            {task.description}
          </Text>
        )}
      </Stack>

      {hasFooter && (
        <Group
          justify="space-between"
          align="center"
          wrap="nowrap"
          mt={12}
          pt={10}
          style={{ borderTop: "1px solid var(--tf-border)" }}
        >
          {due ? (
            <Group gap={5} wrap="nowrap">
              <IconCalendar
                size={13}
                color={due.overdue ? "var(--mantine-color-red-6)" : "var(--tf-text-3)"}
              />
              <Text
                fz={11}
                fw={600}
                c={due.overdue ? "red" : "dimmed"}
              >
                {due.label}
              </Text>
            </Group>
          ) : (
            <span />
          )}

          {task.assignee_id != null && (
            <Tooltip
              label={
                assignee
                  ? `Assigned to ${assignee.username}`
                  : assignedToMe
                    ? "Assigned to you"
                    : `Assigned to user #${task.assignee_id}`
              }
            >
              <Group gap={6} wrap="nowrap">
                <Avatar
                  size={22}
                  radius="xl"
                  variant={assignedToMe ? "gradient" : "filled"}
                  gradient={{ from: "#2f6cf6", to: "#5b8bff", deg: 135 }}
                  color="gray"
                >
                  {(assignee?.username ?? assigneeLabel)?.[0]?.toUpperCase() ?? "?"}
                </Avatar>
                <Text fz={12} fw={600} c={assignedToMe ? "brand" : undefined}>
                  {assigneeLabel}
                </Text>
              </Group>
            </Tooltip>
          )}
        </Group>
      )}
    </Card>
  );
}

export default TaskCard;
