import { useState } from "react";
import { Link } from "react-router-dom";
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
      // error toast comes from the hook; keep the form open
    }
  }

  function renderContent() {
    if (isLoading) {
      return <TaskSkeleton />;
    }

    if (workspaces.length === 0) {
      return (
        <EmptyState
          title="No workspaces yet"
          description="Create a workspace to collaborate on tasks with your team."
          action={
            <button type="button" onClick={() => setOpened(true)}>
              Create a workspace
            </button>
          }
        />
      );
    }

    return (
      <ul className="space-y-4">
        {workspaces.map((ws) => {
          const isOwner = ws.owner_id === user?.id;
          return (
            <li key={ws.id} className="border border-border rounded-lg p-4 bg-background hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <Link to={`/workspaces/${ws.id}`} className="text-lg font-semibold text-accent hover:opacity-80">
                    {ws.name}
                  </Link>
                  <span className="text-sm text-muted-foreground ml-2">({isOwner ? "Owner" : "Member"})</span>
                </div>
                {isOwner && (
                  <button 
                    type="button" 
                    onClick={() => setDeleteTarget(ws)}
                    className="text-sm px-3 py-1 rounded bg-error text-white hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {ws.description || "No description"}
              </p>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <PageShell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Workspaces</h1>
          <p className="text-muted-foreground">Shared spaces for collaborating on tasks.</p>
        </div>
        <button 
          type="button" 
          onClick={() => setOpened(true)}
          className="bg-accent text-accent-foreground font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          New workspace
        </button>
      </div>

      {renderContent()}

      {opened && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div role="dialog" aria-label="New workspace" className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">New workspace</h2>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="workspace-name" className="text-sm font-medium">Name (required)</label>
                <input
                  id="workspace-name"
                  placeholder="e.g. Marketing"
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.currentTarget.value);
                    if (nameError) setNameError(null);
                  }}
                  aria-invalid={nameError ? true : undefined}
                  className="w-full"
                />
                {nameError && <p className="text-xs text-error">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="workspace-description" className="text-sm font-medium">Description</label>
                <textarea
                  id="workspace-description"
                  placeholder="What is this workspace for? (optional)"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setOpened(false)}
                  className="flex-1 bg-muted text-foreground font-medium py-2 px-4 rounded hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createWorkspace.isPending}
                  className="flex-1 bg-accent text-accent-foreground font-medium py-2 px-4 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete workspace"
        description={`Delete "${deleteTarget?.name ?? ""}"? Its tasks and invitations will be removed too. This can't be undone.`}
        onConfirm={() => deleteWorkspace.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export default Workspaces;
