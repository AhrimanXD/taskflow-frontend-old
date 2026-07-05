import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">Create your account</h1>
          <p className="text-muted-foreground">Start organizing work with your team.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.form && <p role="alert">{errors.form}</p>}

          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium">Email</label>
            <input
              id="register-email"
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
            <label htmlFor="register-username" className="text-sm font-medium">Username</label>
            <input
              id="register-username"
              placeholder="yourusername"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              aria-invalid={Boolean(errors.username)}
              required
              className="w-full"
            />
            {errors.username && <p className="text-xs text-error">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              aria-invalid={Boolean(errors.password)}
              required
              className="w-full"
            />
            {errors.password && <p className="text-xs text-error">{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-medium py-2 px-4 rounded hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account? <Link to="/login" className="text-accent font-medium hover:opacity-80">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
