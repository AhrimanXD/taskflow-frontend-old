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
      <ul>
        {workspaces.map((ws) => {
          const isOwner = ws.owner_id === user?.id;
          return (
            <li key={ws.id}>
              <Link to={`/workspaces/${ws.id}`}>{ws.name}</Link>{" "}
              ({isOwner ? "Owner" : "Member"})
              {ws.description ? <p>{ws.description}</p> : <p>No description</p>}
              {isOwner && (
                <button type="button" onClick={() => setDeleteTarget(ws)}>
                  Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <PageShell>
      <h1>Workspaces</h1>
      <p>Shared spaces for collaborating on tasks.</p>
      <button type="button" onClick={() => setOpened(true)}>
        New workspace
      </button>

      {renderContent()}

      {opened && (
        <div role="dialog" aria-label="New workspace">
          <h2>New workspace</h2>
          <form onSubmit={submit}>
            <div>
              <label htmlFor="workspace-name">Name (required)</label>
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
              />
              {nameError && <p>{nameError}</p>}
            </div>
            <div>
              <label htmlFor="workspace-description">Description</label>
              <textarea
                id="workspace-description"
                placeholder="What is this workspace for? (optional)"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />
            </div>
            <button type="button" onClick={() => setOpened(false)}>
              Cancel
            </button>
            <button type="submit" disabled={createWorkspace.isPending}>
              Create
            </button>
          </form>
        </div>
      )}

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
