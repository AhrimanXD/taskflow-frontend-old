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
    <div>
      <h1>Create your account</h1>
      <p>Start organizing work with your team.</p>

      <form onSubmit={handleSubmit} noValidate>
        {errors.form && <p role="alert">{errors.form}</p>}

        <div>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
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
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            placeholder="yourusername"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            aria-invalid={Boolean(errors.username)}
            required
          />
          {errors.username && <p>{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            aria-invalid={Boolean(errors.password)}
            required
          />
          {errors.password && <p>{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
