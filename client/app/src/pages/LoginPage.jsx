import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const colors = {
  page: '#F4F6F8',
  surface: '#FFFFFF',
  border: '#D9DEE5',
  primary: '#2563EB',
  text: '#172033',
  secondary: '#667085',
};

function ShieldIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2L4 7v9c0 7.18 5.16 13.9 12 15.5C22.84 29.9 28 23.18 28 16V7L16 2z" fill={colors.primary} />
      <path d="m13 16.5 2.5 2.5L20 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoginPage() {
  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then(({ user: signedInUser }) => {
        if (signedInUser) {
          window.location.replace('/home');
        }
      })
      .catch((error) => console.error('Unable to load sign-in session:', error));
  }, []);

  return (
    <main style={styles.page}>
      <style>{`
        html, body { margin: 0; min-height: 100%; }
        * { box-sizing: border-box; }
        .check-in-link:hover { text-decoration: underline !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .sign-in-card { padding: 32px 24px !important; }
        }
      `}</style>

      <section className="sign-in-card" style={styles.card}>
        <div style={styles.iconWrap}><ShieldIcon /></div>
        <h1 style={styles.title}>SARLINK IST &amp; Admin Sign In</h1>
        <p style={styles.description}>
          Authorized personnel only. Sign in with your organization Google account.
        </p>
        <div style={styles.divider} />
        <div style={styles.googleLogin}>
          <GoogleLogin
            onError={() => console.error('Google Sign-In Failed')}
            ux_mode="redirect"
            login_uri={`${window.location.origin}/api/auth/google`}
            theme="filled_blue"
            shape="pill"
            text="signin_with"
            width="304"
          />
        </div>
        <div style={styles.dividerSmall} />
        <div style={{ textAlign: 'center' }}>
          <p style={styles.helperText}>Not an admin?</p>
          <a className="check-in-link" href="/check-in" style={styles.link}>
            Go to Incident Response Check-In Page
          </a>
        </div>
      </section>
      <p style={styles.footer}>Access is restricted to authorized organization members only.</p>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '24px',
    background: colors.page,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '48px',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    background: colors.surface,
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  iconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  title: { color: colors.text, fontSize: '24px', fontWeight: 600, lineHeight: 1.25, margin: '0 0 10px' },
  description: { color: colors.secondary, fontSize: '14px', lineHeight: 1.5, margin: 0 },
  divider: { borderTop: `1px solid ${colors.border}`, margin: '32px 0' },
  dividerSmall: { borderTop: `1px solid ${colors.border}`, margin: '24px 0' },
  googleLogin: { display: 'flex', justifyContent: 'center' },
  helperText: { color: colors.secondary, fontSize: '14px', margin: '0 0 8px' },
  link: { color: colors.primary, fontSize: '14px', fontWeight: 600, textDecoration: 'none' },
  footer: { color: colors.secondary, fontSize: '13px', textAlign: 'center', margin: '24px 0 0' },
};
