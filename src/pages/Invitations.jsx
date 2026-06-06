import {
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import { useMyInvitations, useRespondInvitation } from "../hooks/useInvitations";
import PageShell from "../components/PageShell";
import TaskSkeleton from "../components/TaskSkeleton";
import EmptyState from "../components/EmptyState";

function Invitations() {
  const { data: invites = [], isLoading } = useMyInvitations("pending");
  const respond = useRespondInvitation();

  function renderContent() {
    if (isLoading) {
      return (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {Array.from({ length: 2 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </SimpleGrid>
      );
    }

    if (invites.length === 0) {
      return (
        <EmptyState
          icon={<IconMail size={28} />}
          title="No pending invitations"
          description="When someone invites you to a workspace, it'll show up here."
        />
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {invites.map((inv) => {
          const busy = respond.isPending && respond.variables?.id === inv.id;
          return (
            <Card key={inv.id} withBorder radius="md" padding="md">
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} lineClamp={1}>
                    {inv.workspace?.name}
                  </Text>
                  <Badge variant="light" color="indigo">
                    {inv.role}
                  </Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  <strong>{inv.inviter?.username}</strong> invited you to join.
                </Text>
                <Group mt="sm">
                  <Button
                    size="xs"
                    loading={busy && respond.variables?.action === "accept"}
                    onClick={() => respond.mutate({ id: inv.id, action: "accept" })}
                  >
                    Accept
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    loading={busy && respond.variables?.action === "decline"}
                    onClick={() => respond.mutate({ id: inv.id, action: "decline" })}
                  >
                    Decline
                  </Button>
                </Group>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>
    );
  }

  return (
    <PageShell>
      <Stack gap={4} mb="lg">
        <Title order={2}>Invitations</Title>
        <Text c="dimmed" size="sm">
          Workspace invitations waiting for your response.
        </Text>
      </Stack>
      {renderContent()}
    </PageShell>
  );
}

export default Invitations;
