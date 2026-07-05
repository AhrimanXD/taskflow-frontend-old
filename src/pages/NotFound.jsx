import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        {/* 404 Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            font: 'bold 120px Manrope,sans-serif',
            color: 'var(--text3)',
            lineHeight: '1',
            letterSpacing: '-.03em'
          }}>
            404
          </div>
          <h1 style={{
            margin: 0,
            font: '800 32px Manrope,sans-serif',
            color: 'var(--text)',
            letterSpacing: '-.02em'
          }}>
            Page not found
          </h1>
          <p style={{
            font: '500 15px Manrope,sans-serif',
            color: 'var(--text2)',
            margin: 0,
            lineHeight: '1.6'
          }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved to another location.
          </p>
        </div>

        {/* Action */}
        <Link 
          to="/dashboard" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--primary)',
            color: 'var(--onPrimary)',
            font: '600 15px Manrope,sans-serif',
            padding: '12px 28px',
            borderRadius: '11px',
            textDecoration: 'none',
            boxShadow: '0 6px 16px rgba(47,108,246,.32)',
            transition: 'opacity 200ms',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
