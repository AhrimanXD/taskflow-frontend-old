import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MoreHorizontal, Plus, Users } from "lucide-react";
import {
  useWorkspaces,
  useCreateWorkspace,
  useDeleteWorkspace,
} from "../hooks/useWorkspaces";
import { useAuth } from "../context/auth-context";
import PageShell from "../components/PageShell";
import TaskSkeleton from "../components/TaskSkeleton";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function WorkspaceCard({ ws, isOwner, onDelete }) {
  return (
    <div className="tf-card rounded-xl border border-border bg-card p-4">
      <div className="flex flex-nowrap items-start justify-between gap-2">
        <Link
          to={`/workspaces/${ws.id}`}
          className="min-w-0 flex-1 no-underline"
        >
          <div className="flex flex-nowrap items-center gap-3">
            <div
              className="flex size-[38px] shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white"
              style={{ background: "var(--tf-brand-gradient)" }}
            >
              {ws.name?.[0]?.toUpperCase() ?? "W"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {ws.name}
              </p>
              {ws.description ? (
                <p className="truncate text-sm text-muted-foreground">
                  {ws.description}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No description
                </p>
              )}
            </div>
          </div>
        </Link>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Actions"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <MoreHorizontal className="size-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {isOwner ? (
          <Badge className="bg-accent text-primary">Owner</Badge>
        ) : (
          <Badge variant="secondary">Member</Badge>
        )}
        <Link
          to={`/workspaces/${ws.id}`}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

function Workspaces() {
  const { user } = useAuth();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function resetForm() {
    setName("");
    setDescription("");
    setNameError(null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!name || name.trim().length === 0) {
      setNameError("Name is required");
      return;
    }
    try {
      await createWorkspace.mutateAsync({
        name: name.trim(),
        description: description?.trim() || null,
      });
      resetForm();
      setOpened(false);
    } catch {
      // error toast comes from the hook; keep the dialog open
    }
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

    if (workspaces.length === 0) {
      return (
        <EmptyState
          icon={<Users className="size-7" />}
          title="No workspaces yet"
          description="Create a workspace to collaborate on tasks with your team."
          action={
            <Button className="mt-2" onClick={() => setOpened(true)}>
              <Plus />
              Create a workspace
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <WorkspaceCard
            key={ws.id}
            ws={ws}
            isOwner={ws.owner_id === user?.id}
            onDelete={() => setDeleteTarget(ws)}
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
            Workspaces
          </h1>
          <p className="text-sm text-muted-foreground">
            Shared spaces for collaborating on tasks.
          </p>
        </div>
        <Button onClick={() => setOpened(true)} className="shrink-0">
          <Plus />
          New workspace
        </Button>
      </div>

      {renderContent()}

      <Dialog open={opened} onOpenChange={setOpened}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="workspace-name"
                placeholder="e.g. Marketing"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.currentTarget.value);
                  if (nameError) setNameError(null);
                }}
                aria-invalid={nameError ? true : undefined}
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Textarea
                id="workspace-description"
                placeholder="What is this workspace for? (optional)"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />
            </div>
            <DialogFooter className="mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpened(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWorkspace.isPending}>
                {createWorkspace.isPending && (
                  <Loader2 className="animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete workspace"
        description={`Delete “${deleteTarget?.name ?? ""}”? Its tasks and invitations will be removed too. This can’t be undone.`}
        onConfirm={() => deleteWorkspace.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export default Workspaces;
