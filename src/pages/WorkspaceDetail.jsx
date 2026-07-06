import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useWorkspace, useWorkspaceMembers } from "../hooks/useWorkspaces";
import {
  useWorkspaceInvitations,
  useCreateInvitation,
  useRevokeInvitation,
} from "../hooks/useInvitations";
import PageShell from "../components/PageShell";
import WorkspaceTasks from "../components/WorkspaceTasks";
import { ArrowLeft, Send } from "lucide-react";

function MembersList({ workspaceId }) {
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-[var(--color-surface-hover)] animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.user_id}
          className="flex items-center justify-between bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--color-primary)]">
                {m.user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-[var(--color-text)]">{m.user?.username}</span>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              m.role === "admin"
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                : "bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]"
            }`}
          >
            {m.role}
          </span>
        </div>
      ))}
    </div>
  );
}

function InviteManager({ workspaceId }) {
  const invitesQuery = useWorkspaceInvitations(workspaceId, "pending");
  const createInvitation = useCreateInvitation(workspaceId);
  const revokeInvitation = useRevokeInvitation(workspaceId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [emailError, setEmailError] = useState(null);

  if (invitesQuery.isError) {
    const status = invitesQuery.error?.response?.status;
    if (status === 403) {
      return (
        <p className="text-sm text-[var(--color-text-tertiary)] italic">
          Only the workspace owner or admins can manage invitations.
        </p>
      );
    }
    return (
      <p role="alert" className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">
        Could not load invitations.
      </p>
    );
  }

  async function submit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email");
      return;
    }
    try {
      await createInvitation.mutateAsync({ invitee_email: email.trim(), role });
      setEmail("");
      setRole("member");
      setEmailError(null);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setEmailError(detail || "Could not send invitation");
    }
  }

  const invites = invitesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="invite-email" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
            Invite by email
          </label>
          <input
            id="invite-email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => { setEmail(e.currentTarget.value); if (emailError) setEmailError(null); }}
            aria-invalid={emailError ? true : undefined}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 aria-invalid:border-[var(--color-danger)]"
          />
          {emailError && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="invite-role" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.currentTarget.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 cursor-pointer"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={createInvitation.isPending}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer shadow-sm"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>

      <div>
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Pending invitations</h3>
        {invitesQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-[var(--color-surface-hover)] animate-pulse" />
            ))}
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-8 bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-tertiary)]">No pending invitations.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invites.map((inv) => {
              const revoking = revokeInvitation.isPending && revokeInvitation.variables === inv.id;
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between bg-[var(--color-surface-secondary)] rounded-xl border border-[var(--color-border)] px-4 py-3 hover:border-[var(--color-border-hover)] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-warning-light)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--color-warning)]">
                        {inv.invitee?.username?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[var(--color-text)]">
                        {inv.invitee?.username ?? "Unknown"}
                      </span>
                      <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">{inv.role}</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                      {inv.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={revoking}
                    onClick={() => revokeInvitation.mutate(inv.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] disabled:opacity-50 transition-all duration-200 cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceDetail() {
  const { id } = useParams();
  const workspaceId = Number(id);
  const { user } = useAuth();
  const { data: workspace, isLoading, isError, error } = useWorkspace(workspaceId);
  const [tab, setTab] = useState("tasks");

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[var(--color-surface-hover)] rounded animate-pulse" />
          <div className="h-4 w-72 bg-[var(--color-surface-hover)] rounded animate-pulse" />
        </div>
      </PageShell>
    );
  }

  if (isError) {
    const status = error?.response?.status;
    return (
      <PageShell>
        <Link to="/workspaces" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to workspaces
        </Link>
        <p role="alert" className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 rounded-lg px-4 py-3">
          {status === 403 || status === 404
            ? "This workspace doesn't exist or you don't have access to it."
            : "Could not load this workspace."}
        </p>
      </PageShell>
    );
  }

  const isOwner = workspace.owner_id === user?.id;

  return (
    <PageShell>
      <Link to="/workspaces" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-200 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to workspaces
      </Link>

      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[var(--color-primary)]">
              {workspace.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{workspace.name}</h1>
            {workspace.description && (
              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{workspace.description}</p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
            isOwner ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]"
          }`}
        >
          {isOwner ? "Owner" : "Member"}
        </span>
      </div>

      <div role="tablist" className="flex gap-1 mt-5 mb-5 border-b border-[var(--color-border)]">
        {["tasks", "members"].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all duration-200 cursor-pointer capitalize ${
              tab === t
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            {t === "members" ? "Members & invitations" : "Tasks"}
          </button>
        ))}
      </div>

      {tab === "tasks" ? (
        <WorkspaceTasks workspaceId={workspaceId} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Members</h2>
            <MembersList workspaceId={workspaceId} />
          </section>
          <section>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Invitations</h2>
            <InviteManager workspaceId={workspaceId} />
          </section>
        </div>
      )}
    </PageShell>
  );
}

export default WorkspaceDetail;
