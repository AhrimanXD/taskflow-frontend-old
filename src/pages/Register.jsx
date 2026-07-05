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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface)' }}>
      {/* Left form section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: 'var(--surface)' }}>
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg,#2f6cf6,#5b8bff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <span style={{ font: '800 18px Manrope,sans-serif', color: 'var(--text)', letterSpacing: '-.02em' }}>Taskflow</span>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ margin: 0, font: '800 27px Manrope,sans-serif', color: 'var(--text)', letterSpacing: '-.02em' }}>Create your account</h2>
            <span style={{ font: '500 14px Manrope,sans-serif', color: 'var(--text2)' }}>Free for your whole team. No credit card needed.</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errors.form && (
              <div style={{ background: 'rgba(210,63,79,0.1)', color: '#d23f4f', padding: '10px 14px', borderRadius: '8px', font: '500 13px Manrope,sans-serif' }}>
                {errors.form}
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ font: '600 13px Manrope,sans-serif', color: 'var(--text)' }}>Full name</span>
              <input
                type="text"
                defaultValue="John Doe"
                style={{
                  height: '44px',
                  borderRadius: '11px',
                  border: '1px solid var(--border2)',
                  background: 'var(--surface2)',
                  padding: '0 14px',
                  font: '500 14px Manrope,sans-serif',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ font: '600 13px Manrope,sans-serif', color: 'var(--text)' }}>Work email</span>
              <input
                id="register-email"
                type="email"
                defaultValue="john.doe@acme.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                aria-invalid={Boolean(errors.email)}
                required
                style={{
                  height: '44px',
                  borderRadius: '11px',
                  border: '1px solid var(--border2)',
                  background: 'var(--surface2)',
                  padding: '0 14px',
                  font: '500 14px Manrope,sans-serif',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              {errors.email && <span style={{ font: '500 12px Manrope,sans-serif', color: '#d23f4f' }}>{errors.email}</span>}
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ font: '600 13px Manrope,sans-serif', color: 'var(--text)' }}>Password</span>
              <div style={{
                height: '44px',
                borderRadius: '11px',
                border: '1px solid var(--border2)',
                background: 'var(--surface2)',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ font: '500 16px Manrope,sans-serif', color: 'var(--text)', letterSpacing: '2px' }}>•••••••••</span>
              </div>
              <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '3px',
                    background: i <= 2 ? 'var(--doneText)' : '#e8ebef',
                  }}></div>
                ))}
              </div>
              <span style={{ font: '500 11px Manrope,sans-serif', color: 'var(--text2)' }}>Strong password</span>
              {errors.password && <span style={{ font: '500 12px Manrope,sans-serif', color: '#d23f4f' }}>{errors.password}</span>}
            </label>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                height: '48px',
                border: 'none',
                borderRadius: '11px',
                background: 'var(--primary)',
                color: 'var(--onPrimary)',
                font: '700 15px Manrope,sans-serif',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(47,108,246,.32)',
                marginTop: '8px',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 200ms',
              }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ font: '500 12px Manrope,sans-serif', color: 'var(--text3)' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" style={{
                flex: 1,
                height: '46px',
                border: '1px solid var(--border2)',
                background: 'var(--surface)',
                borderRadius: '11px',
                font: '600 14px Manrope,sans-serif',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                </svg>
                Google
              </button>
              <button type="button" style={{
                flex: 1,
                height: '46px',
                border: '1px solid var(--border2)',
                background: 'var(--surface)',
                borderRadius: '11px',
                font: '600 14px Manrope,sans-serif',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--text)">
                  <path d="M12 .5A11.5 11.5 0 0 0 8.37 22.9c.57.1.78-.25.78-.55v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.17a11 11 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.63 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.42.36.79 1.06.79 2.14v3.17c0 .31.21.66.79.55A11.5 11.5 0 0 0 12 .5z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <span style={{ textAlign: 'center', font: '500 13px Manrope,sans-serif', color: 'var(--text2)' }}>
            Already have an account? <b style={{ color: 'var(--primary)', cursor: 'pointer' }}><Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign in free</Link></b>
          </span>
        </div>
      </div>

      {/* Right sidebar with gradient */}
      <div style={{
        width: '46%',
        background: 'linear-gradient(155deg, #2f6cf6 0%, #3b6ef6 45%, #6a5bf6 100%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,.10)',
          top: '-120px',
          right: '-110px',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,.08)',
          bottom: '-80px',
          left: '-60px',
        }}></div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <h1 style={{ margin: 0, font: '800 42px Manrope,sans-serif', color: '#fff', letterSpacing: '-.03em', lineHeight: '1.12' }}>
            Your entire team in one place.
          </h1>
          <p style={{ font: '500 15px Manrope,sans-serif', color: 'rgba(255,255,255,.85)', lineHeight: '1.6', margin: 0 }}>
            Manage projects, collaborate in real-time, and ship faster together.
          </p>
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px' }}>
          {[
            { number: '50K+', label: 'Active users' },
            { number: '99.9%', label: 'Uptime' },
            { number: '24/7', label: 'Support' }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ font: '800 20px Manrope,sans-serif', color: '#fff' }}>{stat.number}</span>
              <span style={{ font: '500 12px Manrope,sans-serif', color: 'rgba(255,255,255,.7)' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Register;
