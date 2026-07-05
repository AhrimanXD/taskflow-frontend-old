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

const VIEW_KEY = "taskflow:ws-view";

const CONN_LABEL = {
  connected: "Live — realtime updates are on",
  connecting: "Connecting to live updates",
  reconnecting: "Connection dropped — retrying",
};

// The shared task board, scoped to one workspace. Any member can create,
// edit, and assign; deleting someone else's task is rejected by the server
// (creator or owner/admin only) and surfaces as a toast.
function WorkspaceTasks({ workspaceId }) {
  const { user } = useAuth();
  const { status: connStatus } = useWorkspaceSocket(workspaceId);
  const { data: tasks = [], isLoading, isError } = useTasks(workspaceId);
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

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

  function renderContent() {
    if (isLoading) {
      return <TaskSkeleton />;
    }

    if (isError) {
      return (
        <p role="alert">
          Could not load tasks. Something went wrong while loading this
          workspace&apos;s tasks.
        </p>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          title="No tasks in this workspace"
          description="Create the first task for your team to work on."
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
          currentUserId={user?.id}
          onAssignToggle={handleAssignToggle}
          membersById={membersById}
        />
      );
    }

    return (
      <ul className="space-y-3">
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onStatusChange={handleStatusChange}
              currentUserId={user?.id}
              onAssignToggle={handleAssignToggle}
              membersById={membersById}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <input
            placeholder="Search tasks…"
            aria-label="Search tasks"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded whitespace-nowrap">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          {CONN_LABEL[connStatus] ?? CONN_LABEL.connecting}
        </div>
        <select
          aria-label="View"
          value={view}
          onChange={(e) => changeView(e.currentTarget.value)}
          className="w-28"
        >
          <option value="board">Board</option>
          <option value="grid">Grid</option>
        </select>
        <button 
          type="button" 
          onClick={openCreate}
          className="bg-accent text-accent-foreground font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          New task
        </button>
      </div>

      <div className="mb-8">
        {renderContent()}
      </div>

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
        description={`Delete "${deleteTarget?.title ?? ""}"? This can't be undone.`}
        onConfirm={() => deleteTask.mutate(deleteTarget.id)}
      />
    </>
  );
}

export default WorkspaceTasks;
