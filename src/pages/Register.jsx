import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleAlert, Loader2 } from "lucide-react";
import { useAuth } from "../context/auth-context";
import AuthShell from "../components/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    const newErrors = {};
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Invalid email format";
    if (username.length < 3)
      newErrors.username = "Username must be atleast 3 chars";
    if (password.length < 6)
      newErrors.password = "Password must be atleast 6 chars";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      await register(username, email, password);
      // New accounts land in onboarding (create workspace → invite team).
      navigate("/onboarding", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErrors({ form: detail || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organizing work with your team."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          {errors.form && (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-username">Username</Label>
            <Input
              id="register-username"
              placeholder="yourusername"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              aria-invalid={Boolean(errors.username)}
              required
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">Password</Label>
            <PasswordInput
              id="register-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              aria-invalid={Boolean(errors.password)}
              required
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="mt-1 w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default Register;
