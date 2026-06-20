import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconUser } from "@tabler/icons-react";
import { TASK_STATUSES } from "../constants/tasks";

// Sentinel for the "Unassigned" option — Select values are strings, so we map
// this back to null on submit (unassigning is allowed by the backend).
const UNASSIGNED = "__unassigned__";

// members (when provided) marks workspace context: [{ user_id, user: { username } }].
// Absent => personal task, which isn't assignable, so no assignee field shows.
function TaskFormModal({ opened, onClose, onSubmit, initialValues, mode, members }) {
  const [submitting, setSubmitting] = useState(false);
  const assignable = Array.isArray(members);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      status: "pending",
      due_date: null,
      assignee: UNASSIGNED,
    },
    validate: {
      title: (v) => (!v || v.trim().length === 0 ? "Title is required" : null),
    },
  });

  // Build the assignee options from members. If the task is already assigned to
  // someone not in the list (edge case), keep a fallback option so the current
  // assignment still shows instead of silently blanking.
  const assigneeOptions = useMemo(() => {
    const opts = [{ value: UNASSIGNED, label: "Unassigned" }];
    const seen = new Set();
    for (const m of members ?? []) {
      opts.push({ value: String(m.user_id), label: m.user?.username ?? `User #${m.user_id}` });
      seen.add(m.user_id);
    }
    if (
      initialValues?.assignee_id != null &&
      !seen.has(initialValues.assignee_id)
    ) {
      opts.push({
        value: String(initialValues.assignee_id),
        label: `User #${initialValues.assignee_id}`,
      });
    }
    return opts;
  }, [members, initialValues]);

  // Sync form to the task being edited (or reset) each time the modal opens.
  useEffect(() => {
    if (opened) {
      form.setValues({
        title: initialValues?.title ?? "",
        description: initialValues?.description ?? "",
        status: initialValues?.status ?? "pending",
        // server sends an ISO datetime; DateInput (v8) wants "YYYY-MM-DD"
        due_date: initialValues?.due_date ? initialValues.due_date.slice(0, 10) : null,
        assignee:
          initialValues?.assignee_id != null
            ? String(initialValues.assignee_id)
            : UNASSIGNED,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValues]);

  async function submit(values) {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        status: values.status,
        due_date: values.due_date || null,
      };
      // Only workspace tasks carry an assignee; personal create/update ignore it.
      if (assignable) {
        payload.assignee_id =
          values.assignee === UNASSIGNED ? null : Number(values.assignee);
      }
      await onSubmit(payload);
      onClose();
    } catch {
      // Failure is surfaced via a toast by the mutation; keep the modal open.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === "edit" ? "Edit task" : "New task"}
      centered
    >
      <form onSubmit={form.onSubmit(submit)}>
        <Stack>
          <TextInput
            label="Title"
            placeholder="What needs doing?"
            withAsterisk
            data-autofocus
            {...form.getInputProps("title")}
          />
          <Textarea
            label="Description"
            placeholder="Add details (optional)"
            autosize
            minRows={3}
            maxRows={8}
            {...form.getInputProps("description")}
          />
          <Select
            label="Status"
            data={TASK_STATUSES}
            allowDeselect={false}
            {...form.getInputProps("status")}
          />
          {assignable && (
            <Select
              label="Assignee"
              data={assigneeOptions}
              allowDeselect={false}
              leftSection={<IconUser size={16} />}
              comboboxProps={{ withinPortal: true }}
              {...form.getInputProps("assignee")}
            />
          )}
          <DateInput
            label="Due date"
            placeholder="Pick a date (optional)"
            clearable
            leftSection={<IconCalendar size={16} />}
            {...form.getInputProps("due_date")}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === "edit" ? "Save changes" : "Create task"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default TaskFormModal;
