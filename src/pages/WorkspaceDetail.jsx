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
    return <p>Loading…</p>;
  }
  return (
    <ul>
      {members.map((m) => (
        <li key={m.user_id}>
          {m.user?.username} — {m.role}
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
      return <p>Only the workspace owner or admins can manage invitations.</p>;
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
    <div>
      <form onSubmit={submit}>
        <label htmlFor="invite-email">Invite by email</label>
        <input
          id="invite-email"
          placeholder="teammate@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            if (emailError) setEmailError(null);
          }}
          aria-invalid={emailError ? true : undefined}
        />
        {emailError && <p>{emailError}</p>}
        <label htmlFor="invite-role">Role</label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.currentTarget.value)}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={createInvitation.isPending}>
          Send
        </button>
      </form>

      <h3>Pending invitations</h3>
      {invitesQuery.isLoading ? (
        <p>Loading…</p>
      ) : invites.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        <ul>
          {invites.map((inv) => {
            const revoking =
              revokeInvitation.isPending &&
              revokeInvitation.variables === inv.id;
            return (
              <li key={inv.id}>
                {inv.invitee?.username} — {inv.role} — {inv.status}{" "}
                <button
                  type="button"
                  disabled={revoking}
                  onClick={() => revokeInvitation.mutate(inv.id)}
                >
                  Revoke
                </button>
              </li>
            );
          })}
        </ul>
      )}
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
        <p>Loading…</p>
      </PageShell>
    );
  }

  if (isError) {
    const status = error?.response?.status;
    return (
      <PageShell>
        <Link to="/workspaces">Back to workspaces</Link>
        <p role="alert">
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
      <Link to="/workspaces">Back to workspaces</Link>

      <h1>
        {workspace.name} ({isOwner ? "Owner" : "Member"})
      </h1>
      {workspace.description && <p>{workspace.description}</p>}

      <div role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tasks"}
          onClick={() => setTab("tasks")}
        >
          Tasks
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "members"}
          onClick={() => setTab("members")}
        >
          Members &amp; invitations
        </button>
      </div>

      {tab === "tasks" ? (
        <WorkspaceTasks workspaceId={workspaceId} />
      ) : (
        <div>
          <section>
            <h2>Members</h2>
            <MembersList workspaceId={workspaceId} />
          </section>
          <section>
            <h2>Invitations</h2>
            <InviteManager workspaceId={workspaceId} />
          </section>
        </div>
      )}
    </PageShell>
  );
}

export default WorkspaceDetail;
