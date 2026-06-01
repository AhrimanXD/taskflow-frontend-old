import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { TASK_STATUSES } from "../constants/tasks";

function TaskFormModal({ opened, onClose, onSubmit, initialValues, mode }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValues]);

  async function submit(values) {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        status: values.status,
      });
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.detail || "Something went wrong. Please try again."
      );
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
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
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
