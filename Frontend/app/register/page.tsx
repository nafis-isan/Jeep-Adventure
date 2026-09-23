'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to create account');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.logoWrap}>
        <Logo />
      </div>
      <h1 style={styles.title}>Create your account</h1>
      <p style={styles.subtitle}>Sign up to get started</p>

      <div style={styles.card}>
        <button type="button" style={styles.googleButton}>
          <span style={{ fontSize: 18 }}>G</span>
          <span>Continue with Google</span>
        </button>

        <div style={styles.separatorWrap}>
          <div style={styles.separatorLine} />
          <span>OR</span>
          <div style={styles.separatorLine} />
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        <label style={styles.fieldLabel}>Name</label>
        <input value={name} onChange={(event) => setName(event.target.value)} style={styles.input} placeholder="Your name" />

        <label style={styles.fieldLabel}>Email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} style={styles.input} placeholder="you@example.com" type="email" />

        <label style={styles.fieldLabel}>Password</label>
        <input value={password} onChange={(event) => setPassword(event.target.value)} style={styles.input} type="password" placeholder="••••••••" />

        <label style={styles.fieldLabel}>Confirm Password</label>
        <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={styles.input} type="password" placeholder="••••••••" />

        <button type="button" onClick={handleSubmit} style={loading ? { ...styles.primaryButton, opacity: 0.7 } : styles.primaryButton}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>

      <p style={styles.footerText}>
        Already have an account? <button type="button" onClick={() => router.push('/login')} style={styles.linkButton}>Log in</button>
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
    padding: '44px 20px',
  },
  logoWrap: {
    marginBottom: 18,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1f543e',
    color: '#fff',
    fontSize: 25,
    fontWeight: 700,
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    margin: '8px 0 30px',
    fontSize: 16,
    color: '#7a716b',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: '#fffdfa',
    border: '1px solid #ded9d2',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 2px 6px rgba(37, 43, 37, 0.04)',
  },
  googleButton: {
    width: '100%',
    border: '1px solid #ded9d2',
    borderRadius: 10,
    background: '#fffdfa',
    color: '#1b2b2a',
    fontWeight: 600,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    cursor: 'pointer',
    fontSize: 14,
  },
  separatorWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '20px 0 24px',
    color: '#8a8078',
    fontSize: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    background: '#ded9d2',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 7,
  },
  input: {
    width: '100%',
    border: '1px solid #d9d5d0',
    borderRadius: 10,
    padding: '12px 13px',
    fontSize: 15,
    background: '#fffdfa',
    outline: 'none',
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: 10,
    background: '#285b43',
    color: '#fff',
    padding: '13px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 2,
  },
  linkButton: {
    border: 'none',
    background: 'transparent',
    color: '#17614f',
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
    marginBottom: 14,
    fontSize: 13,
  },
  footerText: {
    marginTop: 22,
    fontSize: 14,
    color: '#756d67',
  },
};
