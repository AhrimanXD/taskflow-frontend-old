import {
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  TextInput,
  Select,
  Anchor,
  Divider,
  Alert,
  Loader,
  Center,
  Tabs,
  Avatar,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconSend,
  IconClipboardList,
  IconUsersGroup,
} from "@tabler/icons-react";
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

const STATUS_COLORS = {
  pending: "yellow",
  accepted: "green",
  declined: "gray",
  revoked: "red",
};

const ROLE_COLORS = { owner: "brand", admin: "violet", member: "gray" };

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
    <Avatar
      size={size}
      radius="xl"
      style={{ background: avatarColor(username), color: "#fff" }}
    >
      {username?.[0]?.toUpperCase() ?? "?"}
    </Avatar>
  );
}

// Overlapping avatar stack for the workspace header (reference "people" pattern).
function MemberStack({ workspaceId }) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);
  if (members.length === 0) return null;
  const shown = members.slice(0, 5);
  const extra = members.length - shown.length;
  return (
    <Tooltip label={`${members.length} member${members.length === 1 ? "" : "s"}`}>
      <Group gap={0} className="tf-avatar-stack" style={{ cursor: "default" }}>
        {shown.map((m) => (
          <MemberAvatar key={m.user_id} username={m.user?.username} size={30} />
        ))}
        {extra > 0 && (
          <Avatar size={30} radius="xl" color="gray">
            +{extra}
          </Avatar>
        )}
      </Group>
    </Tooltip>
  );
}

function MembersList({ workspaceId }) {
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }
  return (
    <Stack gap="sm">
      {members.map((m) => (
        <Group key={m.user_id} justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <MemberAvatar username={m.user?.username} />
            <Text fw={600} fz="sm">
              {m.user?.username}
            </Text>
          </Group>
          <Badge variant="light" color={ROLE_COLORS[m.role] ?? "gray"} tt="capitalize">
            {m.role}
          </Badge>
        </Group>
      ))}
    </Stack>
  );
}

function InviteManager({ workspaceId }) {
  const invitesQuery = useWorkspaceInvitations(workspaceId, "pending");
  const createInvitation = useCreateInvitation(workspaceId);
  const revokeInvitation = useRevokeInvitation(workspaceId);

  const form = useForm({
    initialValues: { invitee_email: "", role: "member" },
    validate: {
      invitee_email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email",
    },
  });

  // Plain members can't manage invitations — the API returns 403.
  if (invitesQuery.isError) {
    const status = invitesQuery.error?.response?.status;
    if (status === 403) {
      return (
        <Alert color="gray" variant="light">
          Only the workspace owner or admins can manage invitations.
        </Alert>
      );
    }
    return <Alert color="red">Could not load invitations.</Alert>;
  }

  async function submit(values) {
    try {
      await createInvitation.mutateAsync({
        invitee_email: values.invitee_email.trim(),
        role: values.role,
      });
      form.reset();
    } catch (e) {
      const detail = e?.response?.data?.detail;
      form.setFieldError("invitee_email", detail || "Could not send invitation");
    }
  }

  const invites = invitesQuery.data ?? [];

  return (
    <Stack>
      <form onSubmit={form.onSubmit(submit)}>
        <Group align="flex-start" gap="sm" wrap="wrap">
          <TextInput
            label="Invite by email"
            placeholder="teammate@example.com"
            style={{ flex: 1, minWidth: 240 }}
            {...form.getInputProps("invitee_email")}
          />
          <Select
            label="Role"
            w={140}
            allowDeselect={false}
            data={[
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin" },
            ]}
            {...form.getInputProps("role")}
          />
          <Button
            mt={25}
            leftSection={<IconSend size={16} />}
            type="submit"
            loading={createInvitation.isPending}
          >
            Send
          </Button>
        </Group>
      </form>

      <Divider label="Pending invitations" labelPosition="left" />

      {invitesQuery.isLoading ? (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      ) : invites.length === 0 ? (
        <Text c="dimmed" size="sm">
          No pending invitations.
        </Text>
      ) : (
        <Stack gap="xs">
          {invites.map((inv) => (
            <Group key={inv.id} justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" fw={500}>
                  {inv.invitee?.username}
                </Text>
                <Badge size="sm" variant="light" color="brand">
                  {inv.role}
                </Badge>
                <Badge size="sm" variant="light" color={STATUS_COLORS[inv.status]}>
                  {inv.status}
                </Badge>
              </Group>
              <Button
                size="compact-sm"
                variant="subtle"
                color="red"
                loading={
                  revokeInvitation.isPending &&
                  revokeInvitation.variables === inv.id
                }
                onClick={() => revokeInvitation.mutate(inv.id)}
              >
                Revoke
              </Button>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
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
        <Center py={80}>
          <Loader />
        </Center>
      </PageShell>
    );
  }

  if (isError) {
    const status = error?.response?.status;
    return (
      <PageShell>
        <Anchor component={Link} to="/workspaces" size="sm">
          <Group gap={4}>
            <IconArrowLeft size={14} /> Back to workspaces
          </Group>
        </Anchor>
        <Alert color="red" mt="md">
          {status === 403 || status === 404
            ? "This workspace doesn't exist or you don't have access to it."
            : "Could not load this workspace."}
        </Alert>
      </PageShell>
    );
  }

  const isOwner = workspace.owner_id === user?.id;

  return (
    <PageShell>
      <Anchor component={Link} to="/workspaces" size="sm" c="dimmed">
        <Group gap={4}>
          <IconArrowLeft size={14} /> Back to workspaces
        </Group>
      </Anchor>

      <Group justify="space-between" align="flex-start" mt="sm" mb="lg" wrap="nowrap">
        <div>
          <Group gap="sm">
            <Title order={2}>{workspace.name}</Title>
            <Badge variant="light" color={isOwner ? "brand" : "gray"}>
              {isOwner ? "Owner" : "Member"}
            </Badge>
          </Group>
          {workspace.description && (
            <Text c="dimmed" size="sm" mt={4}>
              {workspace.description}
            </Text>
          )}
        </div>
        <MemberStack workspaceId={workspaceId} />
      </Group>

      <Tabs defaultValue="tasks" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="tasks" leftSection={<IconClipboardList size={16} />}>
            Tasks
          </Tabs.Tab>
          <Tabs.Tab value="members" leftSection={<IconUsersGroup size={16} />}>
            Members & invitations
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tasks">
          <WorkspaceTasks workspaceId={workspaceId} />
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <Stack gap="lg">
            <Card withBorder radius="lg" padding="lg">
              <Title order={4} mb="md">
                Members
              </Title>
              <MembersList workspaceId={workspaceId} />
            </Card>
            <Card withBorder radius="lg" padding="lg">
              <Title order={4} mb="md">
                Invitations
              </Title>
              <InviteManager workspaceId={workspaceId} />
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </PageShell>
  );
}

export default WorkspaceDetail;
