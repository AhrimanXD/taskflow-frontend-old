import { useMemo, useState } from "react";
import {
  Group,
  Title,
  Text,
  Button,
  SimpleGrid,
  TextInput,
  Select,
  SegmentedControl,
  Center,
  Alert,
  Card,
  Progress,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconSearch,
  IconLayoutColumns,
  IconLayoutGrid,
  IconInbox,
  IconPlus,
  IconClipboardList,
  IconAlertCircle,
  IconActivity,
  IconCheck,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../hooks/useTasks";
import PageShell from "../components/PageShell";
import TaskCard from "../components/TaskCard";
import TaskBoard from "../components/TaskBoard";
import TaskSkeleton from "../components/TaskSkeleton";
import TaskFormModal from "../components/TaskFormModal";
import EmptyState from "../components/EmptyState";
import { filterAndSortTasks } from "../utils/tasks";

const VIEW_KEY = "taskflow:view";

function Dashboard() {
  const { data: tasks = [], isLoading, isError } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState(
    () => localStorage.getItem(VIEW_KEY) || "board"
  );

  const [formOpened, formHandlers] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState(null);

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, { query, sort }),
    [tasks, query, sort]
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const ongoing = tasks.filter((t) => t.status === "ongoing").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, ongoing, completed, completionRate };
  }, [tasks]);

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
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </SimpleGrid>
      );
    }

    if (isError) {
      return (
        <Alert color="red" title="Could not load tasks">
          Something went wrong while loading your tasks. Please refresh.
        </Alert>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          icon={<IconInbox size={28} />}
          title="No tasks yet"
          description="Create your first task to start tracking your work."
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
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <PageShell>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <div>
          <Title order={2} style={{ letterSpacing: "-0.02em" }}>My Tasks</Title>
          <Text c="dimmed" size="sm">
            Everything on your plate.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} style={{ borderRadius: 10 }}>
          New task
        </Button>
      </Group>

      {/* KPI Stats Cards */}
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

      <Group justify="space-between" mb="lg" gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1, minWidth: 220 }}
        />
        <Group gap="sm">
          <Select
            value={sort}
            onChange={(v) => setSort(v || "newest")}
            allowDeselect={false}
            w={150}
            data={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "title", label: "Title A–Z" },
            ]}
          />
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
          </Group>
        </Group>

        {renderContent()}

      <TaskFormModal
        opened={formOpened}
        onClose={formHandlers.close}
        onSubmit={handleSubmit}
        initialValues={editingTask}
        mode={editingTask ? "edit" : "create"}
      />
    </PageShell>
  );
}

export default Dashboard;
