import { Box, Group, Stack, Text } from "@mantine/core";
import TaskCard from "./TaskCard";
import { statusMeta } from "../constants/tasks";

// Per-status accents: the count pill and the tray tint behind the cards.
const COLUMN_STYLE = {
  pending: {
    pill: "var(--tf-surface-2)",
    pillText: "var(--tf-text-2)",
    tray: "var(--tf-tray)",
    accent: false,
  },
  ongoing: {
    // Solid-blue count pill + a thin top accent strip mark in-flight work.
    pill: "var(--tf-primary)",
    pillText: "#fff",
    tray: "var(--tf-tray-active)",
    accent: true,
  },
  completed: {
    pill: "var(--tf-done-bg)",
    pillText: "var(--tf-done-text)",
    tray: "var(--tf-tray)",
    accent: false,
  },
};

function TaskColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  onAssignToggle,
  membersById,
}) {
  const meta = statusMeta(status);
  const accent = COLUMN_STYLE[status] ?? COLUMN_STYLE.pending;

  return (
    <Stack gap="sm">
      {/* Header sits above the tray (reference layout) */}
      <Group gap={8} px={4} wrap="nowrap">
        <Text fz={18} fw={700} style={{ letterSpacing: "-0.01em" }}>
          {meta.label}
        </Text>
        <Box
          className="tf-mono"
          style={{
            minWidth: 24,
            height: 24,
            padding: "0 7px",
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: accent.pill,
            color: accent.pillText,
          }}
        >
          {tasks.length}
        </Box>
      </Group>

      <Box
        style={{
          position: "relative",
          background: accent.tray,
          borderRadius: 18,
          padding: 14,
          minHeight: 480,
          overflow: "hidden",
        }}
      >
        {accent.accent && (
          <Box
            style={{
              position: "absolute",
              insetInline: 0,
              top: 0,
              height: 5,
              background: "var(--tf-accent-soft)",
            }}
          />
        )}
        <Stack gap="sm">
          {tasks.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="lg">
              No tasks
            </Text>
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
                membersById={membersById}
              />
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

export default TaskColumn;
