import { useEffect, useMemo, useState } from "react";
import { TASK_STATUSES } from "../constants/tasks";
import { X } from "lucide-react";

const UNASSIGNED = "__unassigned__";

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "pending",
  due_date: "",
  assignee: UNASSIGNED,
};

function TaskFormModal({ opened, onClose, onSubmit, initialValues, mode, members }) {
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState(EMPTY_FORM);
  const [titleError, setTitleError] = useState(null);
  const assignable = Array.isArray(members);

  function setField(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (field === "title" && titleError) setTitleError(null);
  }

  const assigneeOptions = useMemo(() => {
    const opts = [{ value: UNASSIGNED, label: "Unassigned" }];
    const seen = new Set();
    for (const m of members ?? []) {
      opts.push({ value: String(m.user_id), label: m.user?.username ?? `User #${m.user_id}` });
      seen.add(m.user_id);
    }
    if (initialValues?.assignee_id != null && !seen.has(initialValues.assignee_id)) {
      opts.push({ value: String(initialValues.assignee_id), label: `User #${initialValues.assignee_id}` });
    }
    return opts;
  }, [members, initialValues]);

  useEffect(() => {
    if (opened) {
      setValues({
        title: initialValues?.title ?? "",
        description: initialValues?.description ?? "",
        status: initialValues?.status ?? "pending",
        due_date: initialValues?.due_date ? initialValues.due_date.slice(0, 10) : "",
        assignee: initialValues?.assignee_id != null ? String(initialValues.assignee_id) : UNASSIGNED,
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
      if (assignable) {
        payload.assignee_id = values.assignee === UNASSIGNED ? null : Number(values.assignee);
      }
      await onSubmit(payload);
      onClose();
    } catch {
      // failure surfaced via toast; keep form open
    } finally {
      setSubmitting(false);
    }
  }

  if (!opened) return null;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-overlay)] backdrop-blur-sm">
      <div
        role="dialog"
        aria-label={mode === "edit" ? "Edit task" : "New task"}
        className="w-full max-w-lg bg-[var(--color-surface-secondary)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {mode === "edit" ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
              Title <span className="text-[var(--color-text-tertiary)] font-normal">(required)</span>
            </label>
            <input
              id="task-title"
              placeholder="What needs doing?"
              autoFocus
              value={values.title}
              onChange={(e) => setField("title", e.currentTarget.value)}
              aria-invalid={titleError ? true : undefined}
              className={`${inputCls} aria-invalid:border-[var(--color-danger)]`}
            />
            {titleError && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
              Description
            </label>
            <textarea
              id="task-description"
              placeholder="Add details (optional)"
              rows={3}
              value={values.description}
              onChange={(e) => setField("description", e.currentTarget.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="task-status" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
              Status
            </label>
            <select
              id="task-status"
              value={values.status}
              onChange={(e) => setField("status", e.currentTarget.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {assignable && (
            <div>
              <label htmlFor="task-assignee" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                Assignee
              </label>
              <select
                id="task-assignee"
                value={values.assignee}
                onChange={(e) => setField("assignee", e.currentTarget.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {assigneeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="task-due-date" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
              Due date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={values.due_date}
              onChange={(e) => setField("due_date", e.currentTarget.value)}
              className={inputCls}
            />
          </div>

          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm"
            >
              {submitting ? "Saving\u2026" : mode === "edit" ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;
