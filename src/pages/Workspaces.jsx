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
import { Plus, X } from "lucide-react";

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
    if (isLoading) return <TaskSkeleton />;

    if (workspaces.length === 0) {
      return (
        <EmptyState
          title="No workspaces yet"
          description="Create a workspace to collaborate on tasks with your team."
          action={
            <button type="button" onClick={() => setOpened(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm">
              Create a workspace
            </button>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {workspaces.map((ws) => {
          const isOwner = ws.owner_id === user?.id;
          return (
            <div
              key={ws.id}
              className="group bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[var(--color-primary)]">
                        {ws.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/workspaces/${ws.id}`}
                        className="text-base font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-200"
                      >
                        {ws.name}
                      </Link>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isOwner
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                            : "bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]"
                        }`}
                      >
                        {isOwner ? "Owner" : "Member"}
                      </span>
                    </div>
                  </div>
                  {ws.description ? (
                    <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed ml-[52px]">
                      {ws.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--color-text-tertiary)] italic ml-[52px]">
                      No description
                    </p>
                  )}
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ws)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Workspaces</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Shared spaces for collaborating on tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpened(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          New workspace
        </button>
      </div>

      {renderContent()}

      {opened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-overlay)] backdrop-blur-sm">
          <div
            role="dialog"
            aria-label="New workspace"
            className="w-full max-w-md bg-[var(--color-surface-secondary)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)]">New workspace</h2>
              <button
                type="button"
                onClick={() => { resetForm(); setOpened(false); }}
                className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="workspace-name" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Name <span className="text-[var(--color-text-tertiary)] font-normal">(required)</span>
                </label>
                <input
                  id="workspace-name"
                  placeholder="e.g. Marketing"
                  autoFocus
                  value={name}
                  onChange={(e) => { setName(e.currentTarget.value); if (nameError) setNameError(null); }}
                  aria-invalid={nameError ? true : undefined}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 aria-invalid:border-[var(--color-danger)]"
                />
                {nameError && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{nameError}</p>}
              </div>
              <div>
                <label htmlFor="workspace-description" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Description
                </label>
                <textarea
                  id="workspace-description"
                  placeholder="What is this workspace for? (optional)"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { resetForm(); setOpened(false); }}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWorkspace.isPending}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm"
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
        description={`Delete \u201c${deleteTarget?.name ?? ""}\u201d? Its tasks and invitations will be removed too. This can't be undone.`}
        onConfirm={() => deleteWorkspace.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export default Workspaces;
