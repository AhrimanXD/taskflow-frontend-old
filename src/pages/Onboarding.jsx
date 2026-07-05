import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateWorkspace } from "../hooks/useWorkspaces";
import { invitationService } from "../services/api";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const STEPS = ["Workspace", "Invite team"];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

function BrandMark({ size = 38 }) {
  return (
    <div
      className="tf-brandmark"
      style={{ width: size, height: size, borderRadius: 11 }}
    >
      <Check
        style={{ width: size * 0.55, height: size * 0.55 }}
        color="#fff"
        strokeWidth={3}
        aria-hidden="true"
      />
    </div>
  );
}

// Custom two-step indicator matching the reference (check / number + connector).
function Stepper({ current }) {
  return (
    <div className="flex flex-nowrap items-center justify-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-nowrap items-center">
            <div className="flex flex-nowrap items-center gap-2">
              <span
                className="grid size-[26px] shrink-0 place-items-center rounded-full text-xs font-bold"
                style={{
                  color: done || active ? "#fff" : "var(--tf-text-3)",
                  background: done
                    ? "var(--tf-done-text)"
                    : active
                      ? "var(--tf-primary)"
                      : "var(--tf-surface-2)",
                }}
              >
                {done ? <Check className="size-[15px]" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  active
                    ? "font-bold text-primary"
                    : done
                      ? "font-bold text-foreground"
                      : "font-semibold text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className="mx-3.5 h-0.5 w-14 rounded-sm"
                style={{
                  background: done ? "var(--tf-primary)" : "var(--tf-border-2)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[26px] font-extrabold tracking-tight text-foreground">
            Create your workspace
          </h2>
          <p className="text-sm text-muted-foreground">
            A workspace is where you and your team plan and track work together.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-name">
            Workspace name <span className="text-destructive">*</span>
          </Label>
          <Input
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
          {nameError && <p className="text-sm text-destructive">{nameError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-description">Description</Label>
          <Textarea
            id="onboarding-description"
            placeholder="What is this workspace for? (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
        </div>

        <div className="mt-1 flex justify-end">
          <Button type="submit" disabled={createWorkspace.isPending}>
            {createWorkspace.isPending && <Loader2 className="animate-spin" />}
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[26px] font-extrabold tracking-tight text-foreground">
          Invite your team
        </h2>
        <p className="text-sm text-muted-foreground">
          Taskflow is better together. Add teammates to{" "}
          <span className="font-bold">{workspace.name}</span> to start
          collaborating.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-nowrap items-start gap-3">
            <div className="relative min-w-0 flex-1">
              <Input
                placeholder="teammate@example.com"
                value={row.email}
                disabled={row.sent}
                aria-invalid={row.error ? true : undefined}
                className={row.sent ? "pr-9" : undefined}
                onChange={(e) =>
                  patchRow(i, { email: e.currentTarget.value, error: null })
                }
              />
              {row.sent && (
                <span className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="size-[13px]" strokeWidth={3} />
                </span>
              )}
              {row.error && (
                <p className="mt-1.5 text-sm text-destructive">{row.error}</p>
              )}
            </div>
            <Select
              value={row.role}
              onValueChange={(v) => patchRow(i, { role: v || "member" })}
              disabled={row.sent}
            >
              <SelectTrigger className="w-[130px]" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              aria-label="Remove row"
              disabled={rows.length === 1 || row.sent}
              onClick={() => removeRow(i)}
              className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={addRow}
        >
          <Plus />
          Add another
        </Button>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={onDone}
          className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip for now
        </button>
        {pending > 0 ? (
          <Button disabled={sending} onClick={sendAll}>
            {sending && <Loader2 className="animate-spin" />}
            Send {pending} invite{pending === 1 ? "" : "s"}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={onDone}>
            Go to workspace
            <ArrowRight className="size-4" />
          </Button>
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
    <div
      className="flex min-h-screen flex-col items-center p-6"
      style={{
        background:
          "radial-gradient(1100px 460px at 50% -8%, rgba(47,108,246,0.08), transparent 60%), var(--tf-bg)",
      }}
    >
      <div className="mb-8 mt-10 flex items-center gap-3">
        <BrandMark />
        <span className="text-[22px] font-extrabold tracking-[-0.02em] text-foreground">
          Taskflow
        </span>
      </div>

      <div className="mb-9">
        <Stepper current={step} />
      </div>

      <div
        className="w-full max-w-[520px] rounded-xl border border-border bg-card p-9"
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
      </div>
    </div>
  );
}

export default Onboarding;
