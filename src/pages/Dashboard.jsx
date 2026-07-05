import { useMemo, useState } from "react";
import {
  Columns3,
  Inbox,
  LayoutGrid,
  Plus,
  Search,
  CircleAlert,
} from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VIEW_KEY = "taskflow:view";

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
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
            Something went wrong while loading your tasks. Please refresh.
          </AlertDescription>
        </Alert>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          icon={<Inbox className="size-7" />}
          title="No tasks yet"
          description="Create your first task to start tracking your work."
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
          />
        ))}
      </div>
    );
  }

  return (
    <PageShell>
      <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            My Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything on your plate.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus />
          New task
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] flex-1">
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
          <Select value={sort} onValueChange={(v) => setSort(v || "newest")}>
            <SelectTrigger className="w-[150px]" aria-label="Sort tasks">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
          <ViewToggle value={view} onChange={changeView} />
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
        description={`Delete “${deleteTarget?.title ?? ""}”? This can’t be undone.`}
        onConfirm={() => deleteTask.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export default Dashboard;
