import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Button,
  SimpleGrid,
  TextInput,
  Select,
  SegmentedControl,
  Center,
  Alert,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { taskService } from "../services/api";
import AppHeader from "../components/AppHeader";
import TaskCard from "../components/TaskCard";
import TaskBoard from "../components/TaskBoard";
import TaskSkeleton from "../components/TaskSkeleton";
import TaskFormModal from "../components/TaskFormModal";
import EmptyState from "../components/EmptyState";
import { IconSearch, IconBoard, IconGrid, IconInbox, IconPlus } from "../components/icons";
import { filterAndSortTasks } from "../utils/tasks";

const VIEW_KEY = "taskflow:view";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState(
    () => localStorage.getItem(VIEW_KEY) || "board"
  );

  const [formOpened, formHandlers] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await taskService.list();
        if (active) setTasks(res.data);
      } catch {
        if (active) setError("Could not load your tasks.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function changeView(value) {
    setView(value);
    localStorage.setItem(VIEW_KEY, value);
  }

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, { query, sort }),
    [tasks, query, sort]
  );

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
      const res = await taskService.update(editingTask.id, values);
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)));
    } else {
      const res = await taskService.create(values);
      setTasks((prev) => [res.data, ...prev]);
    }
  }

  async function handleStatusChange(task, status) {
    if (task.status === status) return;
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const res = await taskService.update(task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch {
      setTasks(previous);
      setError("Could not update the task status.");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await taskService.remove(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch {
      setError("Could not delete the task.");
    } finally {
      setDeleting(false);
    }
  }

  function renderContent() {
    if (loading) {
      return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </SimpleGrid>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          icon={<IconInbox />}
          title="No tasks yet"
          description="Create your first task to start tracking your work."
          action={
            <Button mt="sm" leftSection={<IconPlus />} onClick={openCreate}>
              Create a task
            </Button>
          }
        />
      );
    }

    if (visibleTasks.length === 0) {
      return (
        <EmptyState
          icon={<IconSearch size={24} />}
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
          onDelete={setTaskToDelete}
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
            onDelete={setTaskToDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <Box mih="100vh" bg="var(--mantine-color-gray-0)">
      <AppHeader />

      <Container size="lg" py="xl">
        <Group justify="space-between" mb="lg" wrap="nowrap">
          <div>
            <Title order={2}>My Tasks</Title>
            <Text c="dimmed" size="sm">
              Everything on your plate.
            </Text>
          </div>
          <Button leftSection={<IconPlus />} onClick={openCreate}>
            New task
          </Button>
        </Group>

        <Group justify="space-between" mb="lg" gap="sm" wrap="wrap">
          <TextInput
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            leftSection={<IconSearch />}
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
                      <IconBoard />
                      <span>Board</span>
                    </Center>
                  ),
                },
                {
                  value: "grid",
                  label: (
                    <Center style={{ gap: 6 }}>
                      <IconGrid />
                      <span>Grid</span>
                    </Center>
                  ),
                },
              ]}
            />
          </Group>
        </Group>

        {error && (
          <Alert color="red" mb="md" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {renderContent()}
      </Container>

      <TaskFormModal
        opened={formOpened}
        onClose={formHandlers.close}
        onSubmit={handleSubmit}
        initialValues={editingTask}
        mode={editingTask ? "edit" : "create"}
      />

      <Modal
        opened={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete task"
        centered
      >
        <Text size="sm">
          Delete &ldquo;{taskToDelete?.title}&rdquo;? This can&apos;t be undone.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setTaskToDelete(null)}>
            Cancel
          </Button>
          <Button color="red" loading={deleting} onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}

export default Dashboard;
