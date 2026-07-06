import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { CheckSquare, ArrowRight, Kanban, Users, Bell } from "lucide-react";

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
      newErrors.username = "Username must be at least 3 characters";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
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
      navigate("/onboarding", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErrors({ form: detail || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: Kanban, text: "Visual kanban boards" },
    { icon: Users, text: "Real-time team collaboration" },
    { icon: Bell, text: "Instant activity updates" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-primary)] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <CheckSquare className="w-7 h-7 text-white" strokeWidth={2.5} />
          <span className="text-2xl font-extrabold text-white tracking-tight">Taskflow</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Ship faster,<br />
              <span className="text-indigo-200">together.</span>
            </h2>
            <p className="mt-4 text-indigo-100 text-base leading-relaxed max-w-xs">
              Create your free workspace and invite your team in seconds. No credit card required.
            </p>
          </div>
          <ul className="space-y-3">
            {/* eslint-disable-next-line no-unused-vars */}
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-indigo-100">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </span>
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-indigo-200/60 text-xs">
          &copy; {new Date().getFullYear()} Taskflow. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-surface)] px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-10 lg:hidden">
            <CheckSquare className="w-6 h-6 text-[var(--color-primary)]" strokeWidth={2.5} />
            <span className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">Taskflow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              Start organizing work with your team — free forever.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errors.form && (
              <div
                role="alert"
                className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 rounded-lg px-3.5 py-2.5"
              >
                {errors.form}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="block text-sm font-semibold text-[var(--color-text)]">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                aria-invalid={errors.email ? true : undefined}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 aria-invalid:border-[var(--color-danger)] aria-invalid:focus:ring-[var(--color-danger)]/30"
              />
              {errors.email && (
                <p className="text-xs text-[var(--color-danger)]">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-username" className="block text-sm font-semibold text-[var(--color-text)]">
                Username
              </label>
              <input
                id="register-username"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                aria-invalid={errors.username ? true : undefined}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 aria-invalid:border-[var(--color-danger)] aria-invalid:focus:ring-[var(--color-danger)]/30"
              />
              {errors.username && (
                <p className="text-xs text-[var(--color-danger)]">{errors.username}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="block text-sm font-semibold text-[var(--color-text)]">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                aria-invalid={errors.password ? true : undefined}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-150 aria-invalid:border-[var(--color-danger)] aria-invalid:focus:ring-[var(--color-danger)]/30"
              />
              {errors.password && (
                <p className="text-xs text-[var(--color-danger)]">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer shadow-sm"
            >
              {loading ? "Creating account\u2026" : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-xs text-[var(--color-text-tertiary)] text-center">
              By creating an account you agree to our{" "}
              <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">Privacy Policy</a>.
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
