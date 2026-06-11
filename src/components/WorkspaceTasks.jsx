import { useMemo, useState } from "react";
import {
  Group,
  Text,
  Button,
  SimpleGrid,
  TextInput,
  SegmentedControl,
  Center,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconSearch,
  IconLayoutColumns,
  IconLayoutGrid,
  IconClipboardList,
  IconPlus,
} from "@tabler/icons-react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../hooks/useTasks";
import { useAuth } from "../context/auth-context";
import TaskCard from "./TaskCard";
import TaskBoard from "./TaskBoard";
import TaskSkeleton from "./TaskSkeleton";
import TaskFormModal from "./TaskFormModal";
import EmptyState from "./EmptyState";
import { filterAndSortTasks } from "../utils/tasks";

const VIEW_KEY = "taskflow:ws-view";

// The shared task board, scoped to one workspace. Any member can create,
// edit, and assign; deleting someone else's task is rejected by the server
// (creator or owner/admin only) and surfaces as a toast.
function WorkspaceTasks({ workspaceId }) {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, isError } = useTasks(workspaceId);
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
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="md" gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Group gap="sm">
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
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
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
      />
    </>
  );
}

export default WorkspaceTasks;
