import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateWorkspace } from "../hooks/useWorkspaces";
import { invitationService } from "../services/api";

const STEPS = ["Workspace", "Invite team"];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

function WorkspaceStep({ onCreated }) {
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!name || name.trim().length === 0) {
      setNameError("Workspace name is required");
      return;
    }
    try {
      const ws = await createWorkspace.mutateAsync({
        name: name.trim(),
        description: description?.trim() || null,
      });
      onCreated(ws);
    } catch {
      // error toast handled by the mutation
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Create your workspace
        </h2>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          A workspace is where you and your team plan and track work together.
        </p>
      </div>

      <div>
        <label
          htmlFor="onboarding-name"
          className="block text-sm font-semibold text-[var(--color-text)] mb-1.5"
        >
          Workspace name <span className="text-[var(--color-text-tertiary)] font-normal">(required)</span>
        </label>
        <input
          id="onboarding-name"
          placeholder="e.g. Acme Inc"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
            if (nameError) setNameError(null);
          }}
          aria-invalid={nameError ? true : undefined}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 aria-invalid:border-[var(--color-danger)]"
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-[var(--color-danger)]">{nameError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="onboarding-description"
          className="block text-sm font-semibold text-[var(--color-text)] mb-1.5"
        >
          Description
        </label>
        <textarea
          id="onboarding-description"
          placeholder="What is this workspace for? (optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={createWorkspace.isPending}
        className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm shadow-[var(--color-primary)]/20"
      >
        Continue
      </button>
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
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Invite your team
        </h2>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          Taskflow is better together. Add teammates to{" "}
          <span className="font-semibold text-[var(--color-text)]">
            {workspace.name}
          </span>{" "}
          to start collaborating.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="flex-1 min-w-0">
              <input
                placeholder="teammate@example.com"
                value={row.email}
                disabled={row.sent}
                aria-invalid={row.error ? true : undefined}
                onChange={(e) =>
                  patchRow(i, { email: e.currentTarget.value, error: null })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 aria-invalid:border-[var(--color-danger)] disabled:bg-[var(--color-surface-hover)] disabled:text-[var(--color-text-tertiary)]"
              />
              {row.sent && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-success)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Sent
                </span>
              )}
              {row.error && (
                <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                  {row.error}
                </p>
              )}
            </div>
            <select
              aria-label="Role"
              value={row.role}
              disabled={row.sent}
              onChange={(e) =>
                patchRow(i, { role: e.currentTarget.value || "member" })
              }
              className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 cursor-pointer disabled:bg-[var(--color-surface-hover)]"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="button"
              aria-label="Remove row"
              disabled={rows.length === 1 || row.sent}
              onClick={() => removeRow(i)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Add another
      </button>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer"
        >
          Skip for now
        </button>
        {pending > 0 ? (
          <button
            type="button"
            disabled={sending}
            onClick={sendAll}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm shadow-[var(--color-primary)]/20"
          >
            Send {pending} invite{pending === 1 ? "" : "s"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 cursor-pointer shadow-sm shadow-[var(--color-primary)]/20"
          >
            Go to workspace
          </button>
        )}
      </div>
    </div>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-primary-light)]/30 to-[var(--color-surface)] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            <span className="text-[var(--color-primary)]">Task</span>flow
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-light)] text-xs font-semibold text-[var(--color-primary)]">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
            <span>{STEPS[step]}</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface-secondary)] rounded-2xl shadow-lg shadow-[var(--color-primary)]/5 border border-[var(--color-border)] p-8">
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
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
