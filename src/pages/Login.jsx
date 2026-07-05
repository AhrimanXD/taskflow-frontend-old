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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface)' }}>
      {/* Left sidebar with gradient */}
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

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <span style={{ font: '800 20px Manrope,sans-serif', color: '#fff', letterSpacing: '-.02em' }}>Taskflow</span>
        </div>

        {/* Features */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '26px', zIndex: 1 }}>
          <h1 style={{ margin: 0, font: '800 38px Manrope,sans-serif', color: '#fff', letterSpacing: '-.03em', lineHeight: '1.12' }}>
            Plan, track, and ship together — in real time.
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '👤', text: 'Live presence — see who\'s online & editing' },
              { icon: '💬', text: 'Comments, @mentions & threads' },
              { icon: '📅', text: 'Due dates & smart reminders' }
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  {feature.icon}
                </div>
                <span style={{ font: '600 15px Manrope,sans-serif', color: 'rgba(255,255,255,.94)' }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team avatars */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
          <div style={{ display: 'flex', paddingLeft: '6px' }}>
            {['JD', 'AP', 'SS', 'MK', 'LW', 'EB'].map((initials, i) => (
              <div key={i} style={{
                width: '34px',
                height: '34px',
                marginLeft: i > 0 ? '-6px' : 0,
                borderRadius: '50%',
                background: ['#2f6cf6', '#5b8bff', '#3b6ef6', '#6a5bf6', '#4566e6', '#5578e8'][i],
                border: '2px solid #4566e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: '700 12px Manrope,sans-serif',
                color: '#fff',
              }}>
                {initials}
              </div>
            ))}
          </div>
          <span style={{ font: '600 13px Manrope,sans-serif', color: 'rgba(255,255,255,.9)' }}>
            <b style={{ color: '#fff' }}>6 teammates</b> online now
          </span>
        </div>
      </div>

      {/* Right form section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: 'var(--surface)' }}>
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <h2 style={{ margin: 0, font: '800 27px Manrope,sans-serif', color: 'var(--text)', letterSpacing: '-.02em' }}>Welcome back</h2>
            <span style={{ font: '500 14px Manrope,sans-serif', color: 'var(--text2)' }}>Sign in to your Taskflow workspace.</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errors.form && (
              <div style={{ background: 'rgba(210,63,79,0.1)', color: '#d23f4f', padding: '10px 14px', borderRadius: '8px', font: '500 13px Manrope,sans-serif' }}>
                {errors.form}
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ font: '600 13px Manrope,sans-serif', color: 'var(--text)' }}>Email</span>
              <input
                id="login-email"
                type="email"
                defaultValue="john.doe@acme.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                aria-invalid={Boolean(errors.email)}
                required
                style={{
                  height: '46px',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ font: '600 13px Manrope,sans-serif', color: 'var(--text)' }}>Password</span>
                <span style={{ font: '600 13px Manrope,sans-serif', color: 'var(--primary)', cursor: 'pointer' }}>Forgot?</span>
              </div>
              <div style={{
                height: '46px',
                borderRadius: '11px',
                border: '1px solid var(--border2)',
                background: 'var(--surface2)',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  style={{
                    border: 'none',
                    background: 'transparent',
                    font: '500 16px Manrope,sans-serif',
                    color: 'var(--text)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
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
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 200ms',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
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

          {/* Sign up link */}
          <span style={{ textAlign: 'center', font: '500 13px Manrope,sans-serif', color: 'var(--text2)' }}>
            Don&apos;t have an account? <b style={{ color: 'var(--primary)', cursor: 'pointer' }}><Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up free</Link></b>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
