import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Button,
  SimpleGrid,
  Loader,
  Center,
  Alert,
  Modal,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { taskService } from "../services/api";
import AppHeader from "../components/AppHeader";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    // optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    );
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

  return (
    <Box mih="100vh" bg="var(--mantine-color-gray-0)">
      <AppHeader />

      <Container size="lg" py="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>My Tasks</Title>
            <Text c="dimmed" size="sm">
              Everything on your plate.
            </Text>
          </div>
          <Button onClick={openCreate}>New task</Button>
        </Group>

        {error && (
          <Alert color="red" mb="md" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Center py={80}>
            <Loader />
          </Center>
        ) : tasks.length === 0 ? (
          <Paper withBorder radius="md" p="xl">
            <Stack align="center" gap="xs" py="xl">
              <Title order={4}>No tasks yet</Title>
              <Text c="dimmed" size="sm" ta="center">
                Create your first task to start tracking your work.
              </Text>
              <Button mt="sm" onClick={openCreate}>
                Create a task
              </Button>
            </Stack>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={setTaskToDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </SimpleGrid>
        )}
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
