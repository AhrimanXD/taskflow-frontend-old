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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    const newErrors = {};
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Invalid email";
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
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErrors({ form: detail || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account to continue.">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          {errors.form && (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
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
            <Label htmlFor="login-password">Password</Label>
            <PasswordInput
              id="login-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
          </div>

          <Button type="submit" className="mt-1 w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default Login;
