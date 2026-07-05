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
    <form onSubmit={submit}>
      <h2>Create your workspace</h2>
      <p>A workspace is where you and your team plan and track work together.</p>

      <div>
        <label htmlFor="onboarding-name">Workspace name (required)</label>
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
        />
        {nameError && <p>{nameError}</p>}
      </div>

      <div>
        <label htmlFor="onboarding-description">Description</label>
        <textarea
          id="onboarding-description"
          placeholder="What is this workspace for? (optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
      </div>

      <button type="submit" disabled={createWorkspace.isPending}>
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
    <div>
      <h2>Invite your team</h2>
      <p>
        Taskflow is better together. Add teammates to{" "}
        <strong>{workspace.name}</strong> to start collaborating.
      </p>

      {rows.map((row, i) => (
        <div key={i}>
          <input
            placeholder="teammate@example.com"
            value={row.email}
            disabled={row.sent}
            aria-invalid={row.error ? true : undefined}
            onChange={(e) =>
              patchRow(i, { email: e.currentTarget.value, error: null })
            }
          />
          {row.sent && <span> (sent)</span>}
          {row.error && <p>{row.error}</p>}
          <select
            aria-label="Role"
            value={row.role}
            disabled={row.sent}
            onChange={(e) => patchRow(i, { role: e.currentTarget.value || "member" })}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="button"
            aria-label="Remove row"
            disabled={rows.length === 1 || row.sent}
            onClick={() => removeRow(i)}
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addRow}>
        Add another
      </button>

      <div>
        <button type="button" onClick={onDone}>
          Skip for now
        </button>
        {pending > 0 ? (
          <button type="button" disabled={sending} onClick={sendAll}>
            Send {pending} invite{pending === 1 ? "" : "s"}
          </button>
        ) : (
          <button type="button" onClick={onDone}>
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
    <div>
      <h1>Taskflow</h1>
      <p>
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

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
  );
}

export default Onboarding;
