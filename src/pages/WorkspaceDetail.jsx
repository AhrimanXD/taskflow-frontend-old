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

function MembersList({ workspaceId }) {
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  if (isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li key={m.user_id} className="border border-border rounded-lg p-3 bg-muted/50">
          <div className="font-medium text-foreground">{m.user?.username}</div>
          <div className="text-sm text-muted-foreground">{m.role}</div>
        </li>
      ))}
    </ul>
  );
}

function InviteManager({ workspaceId }) {
  const invitesQuery = useWorkspaceInvitations(workspaceId, "pending");
  const createInvitation = useCreateInvitation(workspaceId);
  const revokeInvitation = useRevokeInvitation(workspaceId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [emailError, setEmailError] = useState(null);

  // Plain members can't manage invitations — the API returns 403.
  if (invitesQuery.isError) {
    const status = invitesQuery.error?.response?.status;
    if (status === 403) {
      return <p className="text-muted-foreground">Only the workspace owner or admins can manage invitations.</p>;
    }
    return <p role="alert">Could not load invitations.</p>;
  }

  async function submit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email");
      return;
    }
    try {
      await createInvitation.mutateAsync({
        invitee_email: email.trim(),
        role,
      });
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
      <form onSubmit={submit} className="space-y-4 bg-muted/50 border border-border rounded-lg p-4">
        <div className="space-y-2">
          <label htmlFor="invite-email" className="text-sm font-medium">Invite by email</label>
          <input
            id="invite-email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
              if (emailError) setEmailError(null);
            }}
            aria-invalid={emailError ? true : undefined}
            className="w-full"
          />
          {emailError && <p className="text-xs text-error">{emailError}</p>}
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="invite-role" className="text-sm font-medium">Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.currentTarget.value)}
              className="w-full"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={createInvitation.isPending}
            className="bg-accent text-accent-foreground font-medium px-6 py-2 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            Send
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4">Pending invitations</h3>
        {invitesQuery.isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="text-muted-foreground">No pending invitations.</p>
        ) : (
          <ul className="space-y-2">
            {invites.map((inv) => {
              const revoking =
                revokeInvitation.isPending &&
                revokeInvitation.variables === inv.id;
              return (
                <li key={inv.id} className="border border-border rounded-lg p-3 bg-muted/50 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{inv.invitee?.username}</div>
                    <div className="text-sm text-muted-foreground">{inv.role} — {inv.status}</div>
                  </div>
                  <button
                    type="button"
                    disabled={revoking}
                    onClick={() => revokeInvitation.mutate(inv.id)}
                    className="text-sm px-3 py-1 rounded bg-error text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    Revoke
                  </button>
                </li>
              );
            })}
          </ul>
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
        <p className="text-muted-foreground">Loading…</p>
      </PageShell>
    );
  }

  if (isError) {
    const status = error?.response?.status;
    return (
      <PageShell>
        <Link to="/workspaces" className="text-accent hover:opacity-80 text-sm mb-4 inline-flex">
          ← Back to workspaces
        </Link>
        <p role="alert" className="text-error bg-error/10 border border-error/30 rounded p-4">
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
      <Link to="/workspaces" className="text-accent hover:opacity-80 text-sm mb-6 inline-flex">
        ← Back to workspaces
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {workspace.name} <span className="text-lg font-normal text-muted-foreground">({isOwner ? "Owner" : "Member"})</span>
        </h1>
        {workspace.description && <p className="text-muted-foreground">{workspace.description}</p>}
      </div>

      <div role="tablist" className="flex gap-4 border-b border-border mb-8">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tasks"}
          onClick={() => setTab("tasks")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            tab === "tasks"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Tasks
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "members"}
          onClick={() => setTab("members")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            tab === "members"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Members &amp; invitations
        </button>
      </div>

      {tab === "tasks" ? (
        <WorkspaceTasks workspaceId={workspaceId} />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Members</h2>
            <MembersList workspaceId={workspaceId} />
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Invitations</h2>
            <InviteManager workspaceId={workspaceId} />
          </section>
        </div>
      )}
    </PageShell>
  );
}

export default WorkspaceDetail;
