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
      <ul className="space-y-4">
        {invites.map((inv) => {
          const busy = respond.isPending && respond.variables?.id === inv.id;
          const accepting = busy && respond.variables?.action === "accept";
          const declining = busy && respond.variables?.action === "decline";
          return (
            <li key={inv.id} className="border border-border rounded-lg p-4 bg-muted/50 hover:bg-muted transition-colors">
              <h3 className="text-lg font-semibold mb-2">
                {inv.workspace?.name} <span className="text-sm font-normal text-muted-foreground">({inv.role})</span>
              </h3>
              <p className="text-muted-foreground mb-4">
                <strong className="text-foreground">{inv.inviter?.username}</strong> invited you to join.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={accepting}
                  onClick={() => respond.mutate({ id: inv.id, action: "accept" })}
                  className="flex-1 bg-accent text-accent-foreground font-medium py-2 px-4 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={declining}
                  onClick={() => respond.mutate({ id: inv.id, action: "decline" })}
                  className="flex-1 bg-muted text-foreground font-medium py-2 px-4 rounded hover:bg-border transition-colors disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Invitations</h1>
        <p className="text-muted-foreground">Workspace invitations waiting for your response.</p>
      </div>
      {renderContent()}
    </PageShell>
  );
}

export default Invitations;
