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
      <div className="space-y-4">
        {invites.map((inv) => {
          const busy = respond.isPending && respond.variables?.id === inv.id;
          const accepting = busy && respond.variables?.action === "accept";
          const declining = busy && respond.variables?.action === "decline";
          return (
            <div
              key={inv.id}
              className="bg-[var(--color-surface-secondary)] rounded-2xl border border-[var(--color-border)] p-5 hover:shadow-md hover:border-[var(--color-border-hover)] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--color-primary)]">
                      <path d="M13 4.5a2.5 2.5 0 11.702 1.737L11.414 9l2.288 2.763a2.5 2.5 0 11-.702 1.737L10 10.586l-2.288 2.763a2.5 2.5 0 11-.702-1.737L9.086 9 6.798 6.237a2.5 2.5 0 111.702-1.737L10 7.414 12.288 4.5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--color-text)]">
                        {inv.workspace?.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                        {inv.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      <span className="font-semibold text-[var(--color-text)]">
                        {inv.inviter?.username}
                      </span>{" "}
                      invited you to join.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={accepting}
                    onClick={() =>
                      respond.mutate({ id: inv.id, action: "accept" })
                    }
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm shadow-[var(--color-primary)]/20"
                  >
                    {accepting ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    type="button"
                    disabled={declining}
                    onClick={() =>
                      respond.mutate({ id: inv.id, action: "decline" })
                    }
                    className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {declining ? "Declining…" : "Decline"}
                  </button>
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          Invitations
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Workspace invitations waiting for your response.
        </p>
      </div>
      {renderContent()}
    </PageShell>
  );
}

export default Invitations;
