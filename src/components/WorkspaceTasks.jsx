import { useMemo, useState } from "react";
import {
  Box,
  Group,
  Text,
  Button,
  SimpleGrid,
  TextInput,
  SegmentedControl,
  Center,
  Alert,
  Tooltip,
  Card,
  Progress,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconSearch,
  IconLayoutColumns,
  IconLayoutGrid,
  IconClipboardList,
  IconPlus,
  IconAlertCircle,
  IconActivity,
  IconCheck,
} from "@tabler/icons-react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../hooks/useTasks";
import { useAuth } from "../context/auth-context";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket";
import { useWorkspaceMembers } from "../hooks/useWorkspaces";
import TaskCard from "./TaskCard";
import TaskBoard from "./TaskBoard";
import TaskSkeleton from "./TaskSkeleton";
import TaskFormModal from "./TaskFormModal";
import EmptyState from "./EmptyState";
import { filterAndSortTasks } from "../utils/tasks";

const VIEW_KEY = "taskflow:ws-view";

const CONN_META = {
  connected: {
    label: "Live",
    tip: "Realtime updates are on",
    dot: "var(--tf-online)",
    text: "var(--tf-done-text)",
    bg: "var(--tf-done-bg)",
    pulse: true,
  },
  connecting: {
    label: "Connecting",
    tip: "Connecting to live updates",
    dot: "var(--mantine-color-yellow-6)",
    text: "var(--mantine-color-yellow-7)",
    bg: "var(--mantine-color-yellow-light)",
    pulse: false,
  },
  reconnecting: {
    label: "Reconnecting",
    tip: "Connection dropped — retrying",
    dot: "var(--mantine-color-orange-6)",
    text: "var(--mantine-color-orange-7)",
    bg: "var(--mantine-color-orange-light)",
    pulse: false,
  },
};

// Unobtrusive realtime status pill for the board toolbar (reference "● Live").
function LiveIndicator({ status }) {
  const meta = CONN_META[status] ?? CONN_META.connecting;
  return (
    <Tooltip label={meta.tip} withArrow>
      <Group
        gap={6}
        h={28}
        px={11}
        wrap="nowrap"
        style={{ background: meta.bg, borderRadius: 20, cursor: "default" }}
      >
        <Box
          w={7}
          h={7}
          className={meta.pulse ? "tf-pulse" : undefined}
          style={{ borderRadius: "50%", backgroundColor: meta.dot }}
        />
        <Text className="tf-mono" fz={11} fw={600} style={{ color: meta.text }}>
          {meta.label}
        </Text>
      </Group>
    </Tooltip>
  );
}

// The shared task board, scoped to one workspace. Any member can create,
// edit, and assign; deleting someone else's task is rejected by the server
// (creator or owner/admin only) and surfaces as a toast.
function WorkspaceTasks({ workspaceId }) {
  const { user } = useAuth();
  const { status: connStatus } = useWorkspaceSocket(workspaceId);
  const { data: tasks = [], isLoading, isError } = useTasks(workspaceId);
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const ongoing = tasks.filter((t) => t.status === "ongoing").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, ongoing, completed, completionRate };
  }, [tasks]);

  // user_id -> { id, username } for resolving assignee names on the cards.
  const membersById = useMemo(
    () => Object.fromEntries(members.map((m) => [m.user_id, m.user])),
    [members]
  );
  const createTask = useCreateTask(workspaceId);
  const updateTask = useUpdateTask(workspaceId);
  const deleteTask = useDeleteTask(workspaceId);

  const [query, setQuery] = useState("");
  const [view, setView] = useState(
    () => localStorage.getItem(VIEW_KEY) || "board"
  );

  const [formOpened, formHandlers] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState(null);

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, { query, sort: "newest" }),
    [tasks, query]
  );

  function changeView(value) {
    setView(value);
    localStorage.setItem(VIEW_KEY, value);
  }

  function openCreate() {
    setEditingTask(null);
    formHandlers.open();
  }

  function openEdit(task) {
    setEditingTask(task);
    formHandlers.open();
  }

  async function handleSubmit(values) {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, data: values });
    } else {
      await createTask.mutateAsync(values);
    }
  }

  function handleStatusChange(task, status) {
    if (task.status === status) return;
    updateTask.mutate({ id: task.id, data: { status } });
  }

  function handleAssignToggle(task, assigneeId) {
    updateTask.mutate({ id: task.id, data: { assignee_id: assigneeId } });
  }

  function requestDelete(task) {
    modals.openConfirmModal({
      title: "Delete task",
      centered: true,
      children: (
        <Text size="sm">
          Delete &ldquo;{task.title}&rdquo;? This can&apos;t be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteTask.mutate(task.id),
    });
  }

  function renderContent() {
    if (isLoading) {
      return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </SimpleGrid>
      );
    }

    if (isError) {
      return (
        <Alert color="red" title="Could not load tasks">
          Something went wrong while loading this workspace&apos;s tasks.
        </Alert>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          icon={<IconClipboardList size={28} />}
          title="No tasks in this workspace"
          description="Create the first task for your team to work on."
          action={
            <Button mt="sm" leftSection={<IconPlus size={16} />} onClick={openCreate}>
              Create a task
            </Button>
          }
        />
      );
    }

    if (visibleTasks.length === 0) {
      return (
        <EmptyState
          icon={<IconSearch size={26} />}
          title="No matching tasks"
          description="No tasks match your search. Try a different term."
          action={
            <Button mt="sm" variant="default" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      );
    }

    if (view === "board") {
      return (
        <TaskBoard
          tasks={visibleTasks}
          onEdit={openEdit}
          onDelete={requestDelete}
          onStatusChange={handleStatusChange}
          currentUserId={user?.id}
          onAssignToggle={handleAssignToggle}
          membersById={membersById}
        />
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={openEdit}
            onDelete={requestDelete}
            onStatusChange={handleStatusChange}
            currentUserId={user?.id}
            onAssignToggle={handleAssignToggle}
            membersById={membersById}
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <>
      {/* Workspace KPI Stats Cards */}
      {!isLoading && !isError && tasks.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
          <Card withBorder padding="md" radius="lg" style={{ background: "var(--tf-surface)", borderLeft: "4px solid var(--tf-primary)" }}>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="tf-mono">Total Tasks</Text>
                <Text size="28px" fw={900} mt={4}>{stats.total}</Text>
              </div>
              <ThemeIcon variant="light" size="lg" radius="md" color="blue">
                <IconClipboardList size={20} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder padding="md" radius="lg" style={{ background: "var(--tf-surface)", borderLeft: "4px solid var(--mantine-color-yellow-5)" }}>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="tf-mono">Pending</Text>
                <Text size="28px" fw={900} mt={4}>{stats.pending}</Text>
              </div>
              <ThemeIcon variant="light" size="lg" radius="md" color="yellow">
                <IconAlertCircle size={20} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder padding="md" radius="lg" style={{ background: "var(--tf-surface)", borderLeft: "4px solid var(--mantine-color-indigo-5)" }}>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="tf-mono">Ongoing</Text>
                <Text size="28px" fw={900} mt={4}>{stats.ongoing}</Text>
              </div>
              <ThemeIcon variant="light" size="lg" radius="md" color="indigo">
                <IconActivity size={20} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder padding="md" radius="lg" style={{ background: "var(--tf-surface)", borderLeft: "4px solid var(--tf-online)" }}>
            <Group justify="space-between">
              <div style={{ flex: 1 }}>
                <Group gap="xs" align="baseline">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase" className="tf-mono">Completed</Text>
                  <Badge size="xs" color="green">{stats.completionRate}% Done</Badge>
                </Group>
                <Text size="28px" fw={900} mt={4}>{stats.completed}</Text>
                <Progress value={stats.completionRate} size="xs" radius="xl" color="teal" mt="sm" />
              </div>
              <ThemeIcon variant="light" size="lg" radius="md" color="teal" style={{ alignSelf: "flex-start" }}>
                <IconCheck size={20} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>
      )}

      <Group justify="space-between" mb="md" gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Group gap="sm">
          <LiveIndicator status={connStatus} />
          <SegmentedControl
            value={view}
            onChange={changeView}
            data={[
              {
                value: "board",
                label: (
                  <Center style={{ gap: 6 }}>
                    <IconLayoutColumns size={16} />
                    <span>Board</span>
                  </Center>
                ),
              },
              {
                value: "grid",
                label: (
                  <Center style={{ gap: 6 }}>
                    <IconLayoutGrid size={16} />
                    <span>Grid</span>
                  </Center>
                ),
              },
            ]}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate} style={{ borderRadius: 10 }}>
            New task
          </Button>
        </Group>
      </Group>

      {renderContent()}

      <TaskFormModal
        opened={formOpened}
        onClose={formHandlers.close}
        onSubmit={handleSubmit}
        initialValues={editingTask}
        mode={editingTask ? "edit" : "create"}
        members={members}
      />
    </>
  );
}

export default WorkspaceTasks;
