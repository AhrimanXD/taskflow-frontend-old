import { useMemo, useState } from "react";
import {
  CircleAlert,
  ClipboardList,
  Columns3,
  LayoutGrid,
  Plus,
  Search,
} from "lucide-react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../hooks/useTasks";
import { useAuth } from "../context/auth-context";
import { useWorkspaceMembers } from "../hooks/useWorkspaces";
import TaskCard from "./TaskCard";
import TaskBoard from "./TaskBoard";
import TaskSkeleton from "./TaskSkeleton";
import TaskFormModal from "./TaskFormModal";
import TaskDetailModal from "./TaskDetailModal";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { filterAndSortTasks } from "../utils/tasks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    dot: "#fab005",
    text: "#b08800",
    bg: "rgba(250, 176, 5, 0.12)",
    pulse: false,
  },
  reconnecting: {
    label: "Reconnecting",
    tip: "Connection dropped — retrying",
    dot: "#fd7e14",
    text: "#c2410c",
    bg: "rgba(253, 126, 20, 0.12)",
    pulse: false,
  },
};

// Unobtrusive realtime status pill for the board toolbar (reference "● Live").
function LiveIndicator({ status }) {
  const meta = CONN_META[status] ?? CONN_META.connecting;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex h-7 cursor-default flex-nowrap items-center gap-1.5 rounded-full px-[11px]"
            style={{ background: meta.bg }}
          >
            <span
              className={cn("size-[7px] rounded-full", meta.pulse && "tf-pulse")}
              style={{ backgroundColor: meta.dot }}
            />
            <span className="tf-mono text-[11px] font-semibold" style={{ color: meta.text }}>
              {meta.label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{meta.tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const VIEWS = [
  { value: "board", label: "Board", icon: Columns3 },
  { value: "grid", label: "Grid", icon: LayoutGrid },
];

function ViewToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 rounded-md bg-secondary p-1">
      {VIEWS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <opt.icon className="size-4" />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// The shared task board, scoped to one workspace. Any member can create,
// edit, and assign; deleting someone else's task is rejected by the server
// (creator or owner/admin only) and surfaces as a toast.
function WorkspaceTasks({ workspaceId, connStatus = "connecting" }) {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, isError } = useTasks(workspaceId);
  const { data: members = [] } = useWorkspaceMembers(workspaceId);
  const myRole = members.find((m) => m.user_id === user?.id)?.role;
  const canModerate = myRole === "owner" || myRole === "admin";

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
  const [detailTaskId, setDetailTaskId] = useState(null);
  // Derive from the live list so the detail modal reflects realtime edits.
  const detailTask = tasks.find((t) => t.id === detailTaskId) ?? null;

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
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Could not load tasks</AlertTitle>
          <AlertDescription>
            Something went wrong while loading this workspace&apos;s tasks.
          </AlertDescription>
        </Alert>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title="No tasks in this workspace"
          description="Create the first task for your team to work on."
          action={
            <Button className="mt-2" onClick={openCreate}>
              <Plus />
              Create a task
            </Button>
          }
        />
      );
    }

    if (visibleTasks.length === 0) {
      return (
        <EmptyState
          icon={<Search className="size-[26px]" />}
          title="No matching tasks"
          description="No tasks match your search. Try a different term."
          action={
            <Button variant="outline" className="mt-2" onClick={() => setQuery("")}>
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
          onDelete={setDeleteTarget}
          onStatusChange={handleStatusChange}
          onOpen={(task) => setDetailTaskId(task.id)}
          currentUserId={user?.id}
          onAssignToggle={handleAssignToggle}
          membersById={membersById}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onStatusChange={handleStatusChange}
            onOpen={(t) => setDetailTaskId(t.id)}
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator status={connStatus} />
          <ViewToggle value={view} onChange={changeView} />
          <Button onClick={openCreate}>
            <Plus />
            New task
          </Button>
        </div>
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
        description={`Delete “${deleteTarget?.title ?? ""}”? This can’t be undone.`}
        onConfirm={() => deleteTask.mutate(deleteTarget.id)}
      />

      <TaskDetailModal
        opened={detailTaskId != null && detailTask != null}
        onClose={() => setDetailTaskId(null)}
        task={detailTask}
        workspaceId={workspaceId}
        currentUserId={user?.id}
        canModerate={canModerate}
        membersById={membersById}
      />
    </>
  );
}

export default WorkspaceTasks;
