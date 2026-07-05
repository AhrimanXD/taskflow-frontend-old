import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.form && <p role="alert">{errors.form}</p>}

          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              aria-invalid={Boolean(errors.email)}
              required
              className="w-full"
            />
            {errors.email && <p className="text-xs text-error">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              className="w-full"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-medium py-2 px-4 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Don&apos;t have an account? <Link to="/register" className="text-accent font-medium hover:opacity-80">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
