import { useMemo, useState } from "react";
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
import ConfirmDialog from "../components/ConfirmDialog";
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

  const [formOpened, setFormOpened] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, { query, sort }),
    [tasks, query, sort]
  );

  function changeView(value) {
    setView(value);
    localStorage.setItem(VIEW_KEY, value);
  }

  function openCreate() {
    setEditingTask(null);
    setFormOpened(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setFormOpened(true);
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

  function renderContent() {
    if (isLoading) {
      return <TaskSkeleton />;
    }

    if (isError) {
      return (
        <p role="alert">
          Could not load tasks. Something went wrong while loading your tasks.
          Please refresh.
        </p>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start tracking your work."
          action={
            <button type="button" onClick={openCreate}>
              Create a task
            </button>
          }
        />
      );
    }

    if (visibleTasks.length === 0) {
      return (
        <EmptyState
          title="No matching tasks"
          description="No tasks match your search. Try a different term."
          action={
            <button type="button" onClick={() => setQuery("")}>
              Clear search
            </button>
          }
        />
      );
    }

    if (view === "board") {
      return (
        <TaskBoard
          tasks={visibleTasks}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onStatusChange={handleStatusChange}
        />
      );
    }

    return (
      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onStatusChange={handleStatusChange}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <PageShell>
      <h1>My Tasks</h1>
      <p>Everything on your plate.</p>
      <button type="button" onClick={openCreate}>
        New task
      </button>

      <div>
        <input
          placeholder="Search tasks…"
          aria-label="Search tasks"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <select
          aria-label="Sort tasks"
          value={sort}
          onChange={(e) => setSort(e.currentTarget.value || "newest")}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
        </select>
        <select
          aria-label="View"
          value={view}
          onChange={(e) => changeView(e.currentTarget.value)}
        >
          <option value="board">Board</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      {renderContent()}

      <TaskFormModal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        onSubmit={handleSubmit}
        initialValues={editingTask}
        mode={editingTask ? "edit" : "create"}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete task"
        description={`Delete “${deleteTarget?.title ?? ""}”? This can’t be undone.`}
        onConfirm={() => deleteTask.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export default Dashboard;
