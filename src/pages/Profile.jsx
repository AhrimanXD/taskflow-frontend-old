import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
import { authService } from "../services/api";
import PageShell from "../components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

function errMsg(err, fallback) {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

function Card({ title, description, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const dirty = username !== user?.username || email !== user?.email;

  async function submit(e) {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username can't be empty");
      return;
    }
    setSaving(true);
    try {
      const fields = {};
      if (username !== user?.username) fields.username = username.trim();
      if (email !== user?.email) fields.email = email.trim();
      await updateProfile(fields);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(errMsg(err, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-username">Username</Label>
        <Input
          id="profile-username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
      </div>
      <div>
        <Button type="submit" disabled={!dirty || saving}>
          {saving && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (next !== confirm) {
      toast.error("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        current_password: current,
        new_password: next,
      });
      toast.success("Password changed");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(errMsg(err, "Could not change password"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pw-current">Current password</Label>
        <PasswordInput
          id="pw-current"
          value={current}
          onChange={(e) => setCurrent(e.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pw-new">New password</Label>
        <PasswordInput
          id="pw-new"
          value={next}
          onChange={(e) => setNext(e.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pw-confirm">Confirm new password</Label>
        <PasswordInput
          id="pw-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.currentTarget.value)}
        />
      </div>
      <div>
        <Button type="submit" disabled={saving || !current || !next || !confirm}>
          {saving && <Loader2 className="animate-spin" />}
          Change password
        </Button>
      </div>
    </form>
  );
}

function Profile() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account.</p>
      </div>
      <div className="grid max-w-2xl gap-6">
        <Card title="Profile" description="Your username and email.">
          <ProfileForm />
        </Card>
        <Card title="Password" description="Change your password.">
          <PasswordForm />
        </Card>
      </div>
    </PageShell>
  );
}

export default Profile;
