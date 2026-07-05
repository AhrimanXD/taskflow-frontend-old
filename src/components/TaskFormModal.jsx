import { useEffect, useMemo, useState } from "react";
import { Loader2, User } from "lucide-react";
import { TASK_STATUSES } from "../constants/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Sentinel for the "Unassigned" option — Select values are strings, so we map
// this back to null on submit (unassigning is allowed by the backend).
const UNASSIGNED = "__unassigned__";

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "pending",
  due_date: "",
  assignee: UNASSIGNED,
};

// members (when provided) marks workspace context: [{ user_id, user: { username } }].
// Absent => personal task, which isn't assignable, so no assignee field shows.
function TaskFormModal({ opened, onClose, onSubmit, initialValues, mode, members }) {
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState(EMPTY_FORM);
  const [titleError, setTitleError] = useState(null);
  const assignable = Array.isArray(members);

  function setField(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (field === "title" && titleError) setTitleError(null);
  }

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
      setValues({
        title: initialValues?.title ?? "",
        description: initialValues?.description ?? "",
        status: initialValues?.status ?? "pending",
        // server sends an ISO datetime; the native date input wants "YYYY-MM-DD"
        due_date: initialValues?.due_date ? initialValues.due_date.slice(0, 10) : "",
        assignee:
          initialValues?.assignee_id != null
            ? String(initialValues.assignee_id)
            : UNASSIGNED,
      });
      setTitleError(null);
    }
  }, [opened, initialValues]);

  async function submit(e) {
    e.preventDefault();
    if (!values.title || values.title.trim().length === 0) {
      setTitleError("Title is required");
      return;
    }
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
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="What needs doing?"
              autoFocus
              value={values.title}
              onChange={(e) => setField("title", e.currentTarget.value)}
              aria-invalid={titleError ? true : undefined}
            />
            {titleError && <p className="text-sm text-destructive">{titleError}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Add details (optional)"
              rows={3}
              value={values.description}
              onChange={(e) => setField("description", e.currentTarget.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-status">Status</Label>
            <Select value={values.status} onValueChange={(v) => setField("status", v)}>
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {assignable && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-assignee">Assignee</Label>
              <Select value={values.assignee} onValueChange={(v) => setField("assignee", v)}>
                <SelectTrigger id="task-assignee" className="w-full">
                  <User className="size-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assigneeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-due-date">Due date</Label>
            <Input
              id="task-due-date"
              type="date"
              value={values.due_date}
              onChange={(e) => setField("due_date", e.currentTarget.value)}
            />
          </div>

          <DialogFooter className="mt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {mode === "edit" ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskFormModal;
