import {
  Group,
  Title,
  Text,
  Button,
  SimpleGrid,
  Card,
  Badge,
  Avatar,
  Menu,
  ActionIcon,
  Anchor,
  Modal,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconPlus, IconDots, IconUsersGroup } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import {
  useWorkspaces,
  useCreateWorkspace,
  useDeleteWorkspace,
} from "../hooks/useWorkspaces";
import { useAuth } from "../context/auth-context";
import PageShell from "../components/PageShell";
import TaskSkeleton from "../components/TaskSkeleton";
import EmptyState from "../components/EmptyState";

function Workspaces() {
  const { user } = useAuth();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const [opened, handlers] = useDisclosure(false);

  const form = useForm({
    initialValues: { name: "", description: "" },
    validate: {
      name: (v) => (!v || v.trim().length === 0 ? "Name is required" : null),
    },
  });

  async function submit(values) {
    await createWorkspace.mutateAsync({
      name: values.name.trim(),
      description: values.description?.trim() || null,
    });
    form.reset();
    handlers.close();
  }

  function confirmDelete(ws) {
    modals.openConfirmModal({
      title: "Delete workspace",
      centered: true,
      children: (
        <Text size="sm">
          Delete &ldquo;{ws.name}&rdquo;? Its tasks and invitations will be
          removed too. This can&apos;t be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteWorkspace.mutate(ws.id),
    });
  }

  function renderContent() {
    if (isLoading) {
      return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </SimpleGrid>
      );
    }

    if (workspaces.length === 0) {
      return (
        <EmptyState
          icon={<IconUsersGroup size={28} />}
          title="No workspaces yet"
          description="Create a workspace to collaborate on tasks with your team."
          action={
            <Button mt="sm" leftSection={<IconPlus size={16} />} onClick={handlers.open}>
              Create a workspace
            </Button>
          }
        />
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {workspaces.map((ws) => {
          const isOwner = ws.owner_id === user?.id;
          return (
            <Card key={ws.id} withBorder padding="md" className="tf-card">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Anchor
                  component={Link}
                  to={`/workspaces/${ws.id}`}
                  underline="never"
                  c="inherit"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Avatar
                      variant="gradient"
                      gradient={{ from: "#2f6cf6", to: "#5b8bff", deg: 135 }}
                      radius="md"
                      size={38}
                    >
                      {ws.name?.[0]?.toUpperCase() ?? "W"}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text fw={600} lineClamp={1}>
                        {ws.name}
                      </Text>
                      {ws.description ? (
                        <Text c="dimmed" size="sm" lineClamp={1}>
                          {ws.description}
                        </Text>
                      ) : (
                        <Text c="dimmed" size="sm" fs="italic">
                          No description
                        </Text>
                      )}
                    </div>
                  </Group>
                </Anchor>

                {isOwner && (
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" aria-label="Actions">
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item color="red" onClick={() => confirmDelete(ws)}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>

              <Group justify="space-between" mt="md">
                <Badge variant="light" color={isOwner ? "brand" : "gray"}>
                  {isOwner ? "Owner" : "Member"}
                </Badge>
                <Anchor component={Link} to={`/workspaces/${ws.id}`} size="xs">
                  Open
                </Anchor>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    );
  }

  return (
    <PageShell>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Workspaces</Title>
          <Text c="dimmed" size="sm">
            Shared spaces for collaborating on tasks.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handlers.open}>
          New workspace
        </Button>
      </Group>

      {renderContent()}

      <Modal opened={opened} onClose={handlers.close} title="New workspace" centered>
        <form onSubmit={form.onSubmit(submit)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="e.g. Marketing"
              withAsterisk
              data-autofocus
              {...form.getInputProps("name")}
            />
            <Textarea
              label="Description"
              placeholder="What is this workspace for? (optional)"
              autosize
              minRows={2}
              maxRows={5}
              {...form.getInputProps("description")}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={handlers.close}>
                Cancel
              </Button>
              <Button type="submit" loading={createWorkspace.isPending}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </PageShell>
  );
}

export default Workspaces;
