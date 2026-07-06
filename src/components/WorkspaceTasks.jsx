import { useMemo, useState } from "react";
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
import ConfirmDialog from "./ConfirmDialog";
import { filterAndSortTasks } from "../utils/tasks";
import { Plus, Search, Columns, LayoutGrid } from "lucide-react";

const VIEW_KEY = "taskflow:ws-view";

const CONN_LABEL = {
  connected: "Live \u2014 realtime updates are on",
  connecting: "Connecting to live updates",
  reconnecting: "Connection dropped \u2014 retrying",
};

function WorkspaceTasks({ workspaceId }) {
  const { user } = useAuth();
  const { status: connStatus } = useWorkspaceSocket(workspaceId);
  const { data: tasks = [], isLoading, isError } = useTasks(workspaceId);
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

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

  const [formOpened, setFormOpened] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  function handleAssignToggle(task, assigneeId) {
    updateTask.mutate({ id: task.id, data: { assignee_id: assigneeId } });
  }

  const connDot = {
    connected: "bg-[var(--color-success)]",
    reconnecting: "bg-[var(--color-warning)]",
    connecting: "bg-[var(--color-text-tertiary)]",
  };

  const connText = {
    connected: "text-[var(--color-success)]",
    reconnecting: "text-[var(--color-warning)]",
    connecting: "text-[var(--color-text-tertiary)]",
  };

  function renderContent() {
    if (isLoading) return <TaskSkeleton />;

    if (isError) {
      return (
        <p role="alert" className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 rounded-lg px-4 py-3">
          Could not load tasks. Something went wrong while loading this workspace&apos;s tasks.
        </p>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          title="No tasks in this workspace"
          description="Create the first task for your team to work on."
          action={
            <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm">
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
            <button type="button" onClick={() => setQuery("")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer">
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
          currentUserId={user?.id}
          onAssignToggle={handleAssignToggle}
          membersById={membersById}
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
            currentUserId={user?.id}
            onAssignToggle={handleAssignToggle}
            membersById={membersById}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
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

        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${connText[connStatus] ?? connText.connecting}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connDot[connStatus] ?? connDot.connecting}`} />
          {CONN_LABEL[connStatus] ?? CONN_LABEL.connecting}
        </span>

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

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> New task
        </button>
      </div>

      {renderContent()}

      <TaskFormModal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        onSubmit={handleSubmit}
        initialValues={editingTask}
        mode={editingTask ? "edit" : "create"}
        members={members}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete task"
        description={`Delete \u201c${deleteTarget?.title ?? ""}\u201d? This can't be undone.`}
        onConfirm={() => deleteTask.mutate(deleteTarget.id)}
      />
    </>
  );
}

export default WorkspaceTasks;
