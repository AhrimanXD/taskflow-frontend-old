import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CircleAlert,
  ClipboardList,
  Loader2,
  Send,
  Users,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useWorkspace, useWorkspaceMembers } from "../hooks/useWorkspaces";
import {
  useWorkspaceInvitations,
  useCreateInvitation,
  useRevokeInvitation,
} from "../hooks/useInvitations";
import PageShell from "../components/PageShell";
import WorkspaceTasks from "../components/WorkspaceTasks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_BADGE = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  declined: "bg-secondary text-secondary-foreground",
  revoked: "bg-destructive/10 text-destructive",
};

const ROLE_BADGE = {
  owner: "bg-accent text-primary",
  admin: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  member: "bg-secondary text-secondary-foreground",
};

// Deterministic avatar tint from a username, so each person reads consistently.
const AVATAR_COLORS = [
  "#2f6cf6", "#16b364", "#e84393", "#f5821f", "#6a5bf6", "#0ea5e9", "#d23f4f",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function MemberAvatar({ username, size = 32 }) {
  return (
    <span
      className="flex items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ width: size, height: size, background: avatarColor(username) }}
    >
      {username?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

// Overlapping avatar stack for the workspace header (reference "people" pattern).
function MemberStack({ workspaceId }) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);
  if (members.length === 0) return null;
  const shown = members.slice(0, 5);
  const extra = members.length - shown.length;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="tf-avatar-stack flex cursor-default items-center">
            {shown.map((m) => (
              <MemberAvatar key={m.user_id} username={m.user?.username} size={30} />
            ))}
            {extra > 0 && (
              <span className="flex size-[30px] items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                +{extra}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {members.length} member{members.length === 1 ? "" : "s"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MembersList({ workspaceId }) {
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {members.map((m) => (
        <div key={m.user_id} className="flex flex-nowrap items-center justify-between gap-2">
          <div className="flex flex-nowrap items-center gap-3">
            <MemberAvatar username={m.user?.username} />
            <p className="text-sm font-semibold text-foreground">
              {m.user?.username}
            </p>
          </div>
          <Badge className={cn("capitalize", ROLE_BADGE[m.role] ?? ROLE_BADGE.member)}>
            {m.role}
          </Badge>
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

  // Plain members can't manage invitations — the API returns 403.
  if (invitesQuery.isError) {
    const status = invitesQuery.error?.response?.status;
    if (status === 403) {
      return (
        <Alert>
          <AlertDescription>
            Only the workspace owner or admins can manage invitations.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertDescription>Could not load invitations.</AlertDescription>
      </Alert>
    );
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
    <div className="flex flex-col gap-4">
      <form onSubmit={submit}>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-[240px] flex-1 flex-col gap-2">
            <Label htmlFor="invite-email">Invite by email</Label>
            <Input
              id="invite-email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.currentTarget.value);
                if (emailError) setEmailError(null);
              }}
              aria-invalid={emailError ? true : undefined}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
          <div className="flex w-[140px] flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="mt-[22px]"
            disabled={createInvitation.isPending}
          >
            {createInvitation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            Send
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Pending invitations
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {invitesQuery.isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : invites.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending invitations.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invites.map((inv) => {
            const revoking =
              revokeInvitation.isPending &&
              revokeInvitation.variables === inv.id;
            return (
              <div key={inv.id} className="flex flex-nowrap items-center justify-between gap-2">
                <div className="flex flex-nowrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {inv.invitee?.username}
                  </p>
                  <Badge className="bg-accent text-primary">{inv.role}</Badge>
                  <Badge className={STATUS_BADGE[inv.status] ?? STATUS_BADGE.declined}>
                    {inv.status}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={revoking}
                  onClick={() => revokeInvitation.mutate(inv.id)}
                >
                  {revoking && <Loader2 className="animate-spin" />}
                  Revoke
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorkspaceDetail() {
  const { id } = useParams();
  const workspaceId = Number(id);
  const { user } = useAuth();
  const { data: workspace, isLoading, isError, error } = useWorkspace(workspaceId);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  const backLink = (
    <Link
      to="/workspaces"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> Back to workspaces
    </Link>
  );

  if (isError) {
    const status = error?.response?.status;
    return (
      <PageShell>
        {backLink}
        <Alert variant="destructive" className="mt-4">
          <CircleAlert />
          <AlertDescription>
            {status === 403 || status === 404
              ? "This workspace doesn't exist or you don't have access to it."
              : "Could not load this workspace."}
          </AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  const isOwner = workspace.owner_id === user?.id;

  return (
    <PageShell>
      {backLink}

      <div className="mb-6 mt-3 flex flex-nowrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {workspace.name}
            </h1>
            <Badge
              className={
                isOwner ? "bg-accent text-primary" : "bg-secondary text-secondary-foreground"
              }
            >
              {isOwner ? "Owner" : "Member"}
            </Badge>
          </div>
          {workspace.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}
        </div>
        <MemberStack workspaceId={workspaceId} />
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="mb-6">
          <TabsTrigger value="tasks">
            <ClipboardList className="size-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="size-4" />
            Members &amp; invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <WorkspaceTasks workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="members">
          <div className="flex flex-col gap-6">
            <div className="tf-card rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-extrabold tracking-tight text-foreground">
                Members
              </h2>
              <MembersList workspaceId={workspaceId} />
            </div>
            <div className="tf-card rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-extrabold tracking-tight text-foreground">
                Invitations
              </h2>
              <InviteManager workspaceId={workspaceId} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

export default WorkspaceDetail;
