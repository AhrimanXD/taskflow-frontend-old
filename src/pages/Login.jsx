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
    <div>
      <h1>Welcome back</h1>
      <p>Sign in to your account to continue.</p>

      <form onSubmit={handleSubmit} noValidate>
        {errors.form && <p role="alert">{errors.form}</p>}

        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            aria-invalid={Boolean(errors.email)}
            required
          />
          {errors.email && <p>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p>
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
