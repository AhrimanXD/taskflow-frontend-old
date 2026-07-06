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
import { Plus, Search, LayoutGrid, Columns } from "lucide-react";

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
    if (isLoading) return <TaskSkeleton />;

    if (isError) {
      return (
        <p
          role="alert"
          className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 rounded-lg px-4 py-3"
        >
          Could not load tasks. Something went wrong. Please refresh.
        </p>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start tracking your work."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm"
            >
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
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
            >
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Everything on your plate.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          New task
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
          <input
            placeholder="Search tasks\u2026"
            aria-label="Search tasks"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
          />
        </div>
        <select
          aria-label="Sort tasks"
          value={sort}
          onChange={(e) => setSort(e.currentTarget.value || "newest")}
          className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A\u2013Z</option>
        </select>
        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-secondary)]">
          <button
            type="button"
            onClick={() => changeView("board")}
            title="Board view"
            className={`px-3 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              view === "board"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            <Columns className="w-3.5 h-3.5" /> Board
          </button>
          <button
            type="button"
            onClick={() => changeView("grid")}
            title="Grid view"
            className={`px-3 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              view === "grid"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
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
        description={`Delete \u201c${deleteTarget?.title ?? ""}\u201d? This can't be undone.`}
        onConfirm={() => deleteTask.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export default Dashboard;
