import { useEffect, useMemo, useState } from "react";
import { TASK_STATUSES } from "../constants/tasks";

// Sentinel for the "Unassigned" option — select values are strings, so we map
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
        // server sends an ISO datetime; the date input wants "YYYY-MM-DD"
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
      // Failure is surfaced via a toast by the mutation; keep the form open.
    } finally {
      setSubmitting(false);
    }
  }

  if (!opened) return null;

  return (
    <div role="dialog" aria-label={mode === "edit" ? "Edit task" : "New task"}>
      <h2>{mode === "edit" ? "Edit task" : "New task"}</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="task-title">Title (required)</label>
          <input
            id="task-title"
            placeholder="What needs doing?"
            autoFocus
            value={values.title}
            onChange={(e) => setField("title", e.currentTarget.value)}
            aria-invalid={titleError ? true : undefined}
          />
          {titleError && <p>{titleError}</p>}
        </div>

        <div>
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            placeholder="Add details (optional)"
            rows={3}
            value={values.description}
            onChange={(e) => setField("description", e.currentTarget.value)}
          />
        </div>

        <div>
          <label htmlFor="task-status">Status</label>
          <select
            id="task-status"
            value={values.status}
            onChange={(e) => setField("status", e.currentTarget.value)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {assignable && (
          <div>
            <label htmlFor="task-assignee">Assignee</label>
            <select
              id="task-assignee"
              value={values.assignee}
              onChange={(e) => setField("assignee", e.currentTarget.value)}
            >
              {assigneeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="task-due-date">Due date</label>
          <input
            id="task-due-date"
            type="date"
            value={values.due_date}
            onChange={(e) => setField("due_date", e.currentTarget.value)}
          />
        </div>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}>
          {mode === "edit" ? "Save changes" : "Create task"}
        </button>
      </form>
    </div>
  );
}

export default TaskFormModal;
