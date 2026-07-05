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
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create your workspace</h2>
        <p className="text-muted-foreground">A workspace is where you and your team plan and track work together.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="onboarding-name" className="text-sm font-medium">Workspace name (required)</label>
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
          className="w-full"
        />
        {nameError && <p className="text-xs text-error">{nameError}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="onboarding-description" className="text-sm font-medium">Description</label>
        <textarea
          id="onboarding-description"
          placeholder="What is this workspace for? (optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          className="w-full"
        />
      </div>

      <button 
        type="submit" 
        disabled={createWorkspace.isPending}
        className="bg-accent text-accent-foreground font-medium px-6 py-2 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
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
    <div className="space-y-6 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Invite your team</h2>
        <p className="text-muted-foreground">
          Taskflow is better together. Add teammates to{" "}
          <strong className="text-foreground">{workspace.name}</strong> to start collaborating.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="teammate@example.com"
              value={row.email}
              disabled={row.sent}
              aria-invalid={row.error ? true : undefined}
              onChange={(e) =>
                patchRow(i, { email: e.currentTarget.value, error: null })
              }
              className="flex-1"
            />
            <select
              aria-label="Role"
              value={row.role}
              disabled={row.sent}
              onChange={(e) => patchRow(i, { role: e.currentTarget.value || "member" })}
              className="w-24"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="button"
              aria-label="Remove row"
              disabled={rows.length === 1 || row.sent}
              className="text-sm px-3 py-2 rounded bg-muted hover:bg-border text-foreground disabled:opacity-50 transition-colors"
              onClick={() => removeRow(i)}
            >
              Remove
            </button>
          </div>
        ))}
        {rows.length > 0 && rows.some(r => r.error) && (
          <div className="space-y-2">
            {rows.map((row, i) => 
              row.error ? <p key={i} className="text-xs text-error">{row.error}</p> : null
            )}
          </div>
        )}
        {rows.length > 0 && rows.some(r => r.sent) && (
          <div className="text-sm text-success">
            {rows.filter(r => r.sent).length} invite{rows.filter(r => r.sent).length === 1 ? "" : "s"} sent
          </div>
        )}
      </div>

      <button 
        type="button" 
        onClick={addRow}
        className="text-sm font-medium text-accent hover:opacity-80"
      >
        + Add another
      </button>

      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onDone}
          className="bg-muted text-foreground font-medium px-6 py-2 rounded hover:bg-muted/80 transition-colors"
        >
          Skip for now
        </button>
        {pending > 0 ? (
          <button 
            type="button" 
            disabled={sending} 
            onClick={sendAll}
            className="bg-accent text-accent-foreground font-medium px-6 py-2 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            Send {pending} invite{pending === 1 ? "" : "s"}
          </button>
        ) : (
          <button 
            type="button" 
            onClick={onDone}
            className="bg-accent text-accent-foreground font-medium px-6 py-2 rounded hover:opacity-90 transition-opacity"
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
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Taskflow</h1>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <div className="flex gap-1 mt-4">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-accent" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

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
  );
}

export default Onboarding;
