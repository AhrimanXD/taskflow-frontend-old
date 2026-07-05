import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Group,
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  ActionIcon,
  Anchor,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { toast } from "sonner";
import { IconCheck, IconArrowRight, IconPlus, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useCreateWorkspace } from "../hooks/useWorkspaces";
import { invitationService } from "../services/api";

const STEPS = ["Workspace", "Invite team"];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

function BrandMark({ size = 38 }) {
  return (
    <Box className="tf-brandmark" style={{ width: size, height: size, borderRadius: 11 }}>
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </Box>
  );
}

// Custom two-step indicator matching the reference (check / number + connector).
function Stepper({ current }) {
  return (
    <Group gap={0} justify="center" wrap="nowrap">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Group key={label} gap={0} wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <Box
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: done || active ? "#fff" : "var(--tf-text-3)",
                  background: done
                    ? "var(--tf-done-text)"
                    : active
                      ? "var(--tf-primary)"
                      : "var(--tf-surface-2)",
                }}
              >
                {done ? <IconCheck size={15} stroke={3} /> : i + 1}
              </Box>
              <Text
                fz="sm"
                fw={active || done ? 700 : 600}
                c={active ? "brand" : done ? undefined : "dimmed"}
              >
                {label}
              </Text>
            </Group>
            {i < STEPS.length - 1 && (
              <Box
                style={{
                  width: 56,
                  height: 2,
                  margin: "0 14px",
                  borderRadius: 2,
                  background: done ? "var(--tf-primary)" : "var(--tf-border-2)",
                }}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
}

function WorkspaceStep({ onCreated }) {
  const createWorkspace = useCreateWorkspace();
  const form = useForm({
    initialValues: { name: "", description: "" },
    validate: {
      name: (v) => (!v || v.trim().length === 0 ? "Workspace name is required" : null),
    },
  });

  async function submit(values) {
    try {
      const ws = await createWorkspace.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || null,
      });
      onCreated(ws);
    } catch {
      // error toast handled by the mutation
    }
  }

  return (
    <form onSubmit={form.onSubmit(submit)}>
      <Stack gap="lg">
        <Stack gap={6}>
          <Title order={3} fz={26}>
            Create your workspace
          </Title>
          <Text c="dimmed" fz="sm">
            A workspace is where you and your team plan and track work together.
          </Text>
        </Stack>

        <TextInput
          label="Workspace name"
          placeholder="e.g. Acme Inc"
          size="md"
          data-autofocus
          withAsterisk
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Description"
          placeholder="What is this workspace for? (optional)"
          autosize
          minRows={2}
          maxRows={4}
          {...form.getInputProps("description")}
        />

        <Group justify="flex-end" mt="xs">
          <Button
            type="submit"
            size="md"
            rightSection={<IconArrowRight size={16} />}
            loading={createWorkspace.isPending}
          >
            Continue
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

function InviteStep({ workspace, onDone }) {
  const [rows, setRows] = useState([
    { email: "", role: "member", error: null, sent: false },
  ]);
  const [sending, setSending] = useState(false);

  function patchRow(i, patch) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, { email: "", role: "member", error: null, sent: false }]);
  }
  function removeRow(i) {
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  const pending = rows.filter((r) => r.email.trim() && !r.sent).length;
  const sentCount = rows.filter((r) => r.sent).length;

  async function sendAll() {
    setSending(true);
    const next = rows.map((r) => ({ ...r }));
    let failures = 0;

    for (let i = 0; i < next.length; i++) {
      const r = next[i];
      const email = r.email.trim();
      if (!email || r.sent) continue;
      if (!EMAIL_RE.test(email)) {
        next[i].error = "Enter a valid email";
        failures++;
        continue;
      }
      try {
        await invitationService.create(workspace.id, {
          invitee_email: email,
          role: r.role,
        });
        next[i].sent = true;
        next[i].error = null;
      } catch (e) {
        // Backend invites existing users only — surface its reason (e.g. 404
        // "User not found", 409 already a member / pending) on the row.
        next[i].error = e?.response?.data?.detail || "Could not send invite";
        failures++;
      }
    }

    setRows(next);
    setSending(false);

    const justSent = next.filter((r) => r.sent).length;
    if (failures === 0) {
      toast.success(`${justSent} invite${justSent === 1 ? "" : "s"} sent`);
      onDone();
    } else if (justSent > sentCount) {
      toast.warning("Some invites need attention");
    }
  }

  return (
    <Stack gap="lg">
      <Stack gap={6}>
        <Title order={3} fz={26}>
          Invite your team
        </Title>
        <Text c="dimmed" fz="sm">
          Taskflow is better together. Add teammates to{" "}
          <Text span fw={700} inherit>
            {workspace.name}
          </Text>{" "}
          to start collaborating.
        </Text>
      </Stack>

      <Stack gap="sm">
        {rows.map((row, i) => (
          <Group key={i} gap="sm" align="flex-start" wrap="nowrap">
            <TextInput
              style={{ flex: 1, minWidth: 0 }}
              placeholder="teammate@example.com"
              value={row.email}
              error={row.error}
              disabled={row.sent}
              rightSection={
                row.sent ? (
                  <ThemeIcon size="sm" radius="xl" color="teal" variant="light">
                    <IconCheck size={13} stroke={3} />
                  </ThemeIcon>
                ) : null
              }
              onChange={(e) =>
                patchRow(i, { email: e.currentTarget.value, error: null })
              }
            />
            <Select
              w={130}
              allowDeselect={false}
              disabled={row.sent}
              data={[
                { value: "member", label: "Member" },
                { value: "admin", label: "Admin" },
              ]}
              value={row.role}
              onChange={(v) => patchRow(i, { role: v || "member" })}
            />
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              mt={3}
              aria-label="Remove row"
              disabled={rows.length === 1 || row.sent}
              onClick={() => removeRow(i)}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        ))}

        <Button
          variant="default"
          leftSection={<IconPlus size={16} />}
          onClick={addRow}
          styles={{ root: { borderStyle: "dashed" } }}
          fullWidth
        >
          Add another
        </Button>
      </Stack>

      <Group justify="space-between" mt="xs">
        <Anchor component="button" type="button" c="dimmed" fw={600} fz="sm" onClick={onDone}>
          Skip for now
        </Anchor>
        {pending > 0 ? (
          <Button
            size="md"
            rightSection={<IconArrowRight size={16} />}
            loading={sending}
            onClick={sendAll}
          >
            Send {pending} invite{pending === 1 ? "" : "s"}
          </Button>
        ) : (
          <Button
            size="md"
            rightSection={<IconArrowRight size={16} />}
            onClick={onDone}
          >
            Go to workspace
          </Button>
        )}
      </Group>
    </Stack>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState(null);

  function goToWorkspace() {
    navigate(`/workspaces/${workspace.id}`, { replace: true });
  }

  return (
    <Box
      mih="100vh"
      p="xl"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background:
          "radial-gradient(1100px 460px at 50% -8%, rgba(47,108,246,0.08), transparent 60%), var(--tf-bg)",
      }}
    >
      <Group gap={12} mt={40} mb="xl">
        <BrandMark />
        <Text fw={800} fz={22} style={{ letterSpacing: "-0.02em" }}>
          Taskflow
        </Text>
      </Group>

      <Box mb={36}>
        <Stepper current={step} />
      </Box>

      <Paper
        withBorder
        radius="lg"
        p={36}
        w="100%"
        maw={520}
        style={{ boxShadow: "var(--tf-shadow-md)" }}
      >
        {step === 0 ? (
          <WorkspaceStep
            onCreated={(ws) => {
              setWorkspace(ws);
              setStep(1);
            }}
          />
        ) : (
          <InviteStep workspace={workspace} onDone={goToWorkspace} />
        )}
      </Paper>
    </Box>
  );
}

export default Onboarding;
