import React, { useEffect, useState } from 'react';
import { googleLogout } from '@react-oauth/google';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then(async (response) => {
        const session = await response.json();
        if (!response.ok && session.error === 'session_expired') {
          window.location.replace('/?error=session_expired');
          return;
        }
        return session;
      })
      .then(({ user: signedInUser } = {}) => {
        if (signedInUser) {
          setUser(signedInUser);
        } else {
          window.location.replace('/');
        }
      })
      .catch((error) => {
        console.error('Unable to load sign-in session:', error);
        window.location.replace('/');
      });
  }, []);

  if (!user) return null;

  const clearState = async () => {
    setIsLoggingOut(true);

    try {
      const response = await Promise.race([
        fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Logout request timed out')), 2000);
        }),
      ]);

      if (!response.ok) {
        throw new Error('Logout request failed');
      }
    } catch (error) {
      console.error('Unable to invalidate sign-in session:', error);
    } finally {
      googleLogout();
      setUser(null);
      window.location.replace('/');
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <img src={user.picture} alt={user.name} style={styles.avatar} />
        <h1 style={styles.title}>Welcome, {user.name}</h1>
        <p style={styles.description}>{user.email}</p>
        <p style={styles.message}>You are signed in to SARLINK.</p>
        <button
          type="button"
          onClick={clearState}
          disabled={isLoggingOut}
          style={styles.button}
        >
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '24px',
    background: '#F4F6F8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '48px',
    border: '1px solid #D9DEE5',
    borderRadius: '12px',
    background: '#FFFFFF',
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  title: { color: '#172033', fontSize: '28px', margin: '20px 0 8px' },
  description: { color: '#667085', fontSize: '14px', margin: 0 },
  message: { color: '#172033', fontSize: '16px', margin: '28px 0 24px' },
  button: {
    height: '40px',
    padding: '0 18px',
    border: '1px solid #D9DEE5',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#172033',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
