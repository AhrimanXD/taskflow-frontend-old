import { useMyInvitations, useRespondInvitation } from "../hooks/useInvitations";
import PageShell from "../components/PageShell";
import TaskSkeleton from "../components/TaskSkeleton";
import EmptyState from "../components/EmptyState";

function Invitations() {
  const { data: invites = [], isLoading } = useMyInvitations("pending");
  const respond = useRespondInvitation();

  function renderContent() {
    if (isLoading) {
      return <TaskSkeleton />;
    }

    if (invites.length === 0) {
      return (
        <EmptyState
          title="No pending invitations"
          description="When someone invites you to a workspace, it'll show up here."
        />
      );
    }

    return (
      <ul>
        {invites.map((inv) => {
          const busy = respond.isPending && respond.variables?.id === inv.id;
          const accepting = busy && respond.variables?.action === "accept";
          const declining = busy && respond.variables?.action === "decline";
          return (
            <li key={inv.id}>
              <h3>
                {inv.workspace?.name} ({inv.role})
              </h3>
              <p>
                <strong>{inv.inviter?.username}</strong> invited you to join.
              </p>
              <button
                type="button"
                disabled={accepting}
                onClick={() => respond.mutate({ id: inv.id, action: "accept" })}
              >
                Accept
              </button>
              <button
                type="button"
                disabled={declining}
                onClick={() => respond.mutate({ id: inv.id, action: "decline" })}
              >
                Decline
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <PageShell>
      <h1>Invitations</h1>
      <p>Workspace invitations waiting for your response.</p>
      {renderContent()}
    </PageShell>
  );
}

export default Invitations;
