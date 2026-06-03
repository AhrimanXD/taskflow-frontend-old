import { useEffect, useState } from "react";
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
import { TASK_STATUSES } from "../constants/tasks";

function TaskFormModal({ opened, onClose, onSubmit, initialValues, mode }) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: { title: "", description: "", status: "pending" },
    validate: {
      title: (v) => (!v || v.trim().length === 0 ? "Title is required" : null),
    },
  });

  // Sync form to the task being edited (or reset) each time the modal opens.
  useEffect(() => {
    if (opened) {
      form.setValues({
        title: initialValues?.title ?? "",
        description: initialValues?.description ?? "",
        status: initialValues?.status ?? "pending",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValues]);

  async function submit(values) {
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        status: values.status,
      });
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
