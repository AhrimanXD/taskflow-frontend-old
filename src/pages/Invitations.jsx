import { Loader2, Mail } from "lucide-react";
import { useMyInvitations, useRespondInvitation } from "../hooks/useInvitations";
import PageShell from "../components/PageShell";
import TaskSkeleton from "../components/TaskSkeleton";
import EmptyState from "../components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Invitations() {
  const { data: invites = [], isLoading } = useMyInvitations("pending");
  const respond = useRespondInvitation();

  function renderContent() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (invites.length === 0) {
      return (
        <EmptyState
          icon={<Mail className="size-7" />}
          title="No pending invitations"
          description="When someone invites you to a workspace, it'll show up here."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {invites.map((inv) => {
          const busy = respond.isPending && respond.variables?.id === inv.id;
          const accepting = busy && respond.variables?.action === "accept";
          const declining = busy && respond.variables?.action === "decline";
          return (
            <div key={inv.id} className="tf-card rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-nowrap items-center justify-between gap-2">
                  <p className="truncate font-semibold text-foreground">
                    {inv.workspace?.name}
                  </p>
                  <Badge className="bg-accent text-primary">{inv.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>{inv.inviter?.username}</strong> invited you to join.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={accepting}
                    onClick={() => respond.mutate({ id: inv.id, action: "accept" })}
                  >
                    {accepting && <Loader2 className="animate-spin" />}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={declining}
                    onClick={() => respond.mutate({ id: inv.id, action: "decline" })}
                  >
                    {declining && <Loader2 className="animate-spin" />}
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Invitations
        </h1>
        <p className="text-sm text-muted-foreground">
          Workspace invitations waiting for your response.
        </p>
      </div>
      {renderContent()}
    </PageShell>
  );
}

export default Invitations;
