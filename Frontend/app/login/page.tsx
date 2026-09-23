'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Email or password is incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.logoWrap}>
        <Logo />
      </div>

      <h1 style={styles.title}>Welcome back</h1>
      <p style={styles.subtitle}>Log in to your account</p>

      <div style={styles.card}>
        <button type="button" style={styles.googleButton}>
          <span style={{ fontSize: 18 }}>G</span>
          <span>Continue with Google</span>
        </button>

        <div style={styles.separatorWrap}>
          <div style={styles.separatorLine} />
          <span style={styles.separatorText}>OR</span>
          <div style={styles.separatorLine} />
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        <label style={styles.fieldLabel}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          placeholder="you@example.com"
          type="email"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
          <label style={styles.fieldLabel}>Password</label>
          <button type="button" style={styles.linkButton}>Forgot password?</button>
        </div>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          type="password"
          placeholder="••••••••"
        />

        <button
          type="button"
          onClick={handleSubmit}
          style={loading ? { ...styles.primaryButton, opacity: 0.7 } : styles.primaryButton}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </div>

      <p style={styles.signupText}>
        Don't have an account? <a href="/register" style={styles.linkButton}>Create one</a>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7f5f1',
    color: '#1d2c2a',
    padding: 28,
  },
  logoWrap: {
    marginBottom: 28,
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    background: '#123d34',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    margin: '10px 0 26px',
    fontSize: 18,
    color: '#374340',
  },
  card: {
    width: '100%',
    maxWidth: 470,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid #d9d4d0',
    borderRadius: 18,
    padding: 18,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
  },
  googleButton: {
    width: '100%',
    border: '1px solid #d2d4d3',
    borderRadius: 10,
    background: '#f5f5f4',
    color: '#1b2b2a',
    fontWeight: 600,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    cursor: 'pointer',
    fontSize: 16,
  },
  separatorWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: '18px 0',
    color: '#6d7b78',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    background: '#d9d4d0',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5d4',
    borderRadius: 10,
    padding: '14px 14px',
    fontSize: 17,
    background: '#f8f8f7',
    outline: 'none',
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: 12,
    background: '#123d34',
    color: '#fff',
    padding: '16px 18px',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 12,
  },
  linkButton: {
    border: 'none',
    background: 'transparent',
    color: '#1b6a5d',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    padding: 0,
  },
  error: {
    background: '#fdecea',
    color: '#7f1d1d',
    border: '1px solid #f5c2c7',
    padding: '10px 12px',
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  signupText: {
    marginTop: 20,
    fontSize: 18,
    color: '#2a3735',
  },
};
