'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await resp.json();
      sessionStorage.setItem('access_token', data.access_token);
      router.push('/room');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Origin</h1>
      <p style={styles.subtitle}>Keyboard Teleoperation</p>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={styles.input}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>

      <div style={styles.controls}>
        <h3 style={styles.controlsTitle}>Keyboard Controls</h3>
        <div style={styles.keyGrid}>
          <div style={styles.keyRow}>
            <span style={styles.key}>W</span>
            <span style={styles.keyDesc}>Forward</span>
          </div>
          <div style={styles.keyRow}>
            <span style={styles.key}>S</span>
            <span style={styles.keyDesc}>Backward</span>
          </div>
          <div style={styles.keyRow}>
            <span style={styles.key}>A</span>
            <span style={styles.keyDesc}>Strafe Left</span>
          </div>
          <div style={styles.keyRow}>
            <span style={styles.key}>D</span>
            <span style={styles.keyDesc}>Strafe Right</span>
          </div>
          <div style={styles.keyRow}>
            <span style={styles.key}>Q</span>
            <span style={styles.keyDesc}>Rotate Left</span>
          </div>
          <div style={styles.keyRow}>
            <span style={styles.key}>E</span>
            <span style={styles.keyDesc}>Rotate Right</span>
          </div>
          <div style={styles.keyRow}>
            <span style={styles.key}>X</span>
            <span style={styles.keyDesc}>Stop (Reset)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 320,
  },
  input: {
    padding: '12px 16px',
    fontSize: 16,
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#fff',
    outline: 'none',
  },
  button: {
    padding: '12px 16px',
    fontSize: 16,
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  controls: {
    marginTop: 60,
    textAlign: 'center',
  },
  controlsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  keyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
  },
  keyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 8px',
  },
  key: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    backgroundColor: '#222',
    border: '1px solid #444',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  keyDesc: {
    fontSize: 12,
    color: '#666',
  },
};
