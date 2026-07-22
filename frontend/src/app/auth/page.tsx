'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/chat');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, var(--bg-tertiary), var(--bg-primary))',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', width: '600px', height: '600px', background: 'var(--accent-glow)',
        filter: 'blur(100px)', borderRadius: '50%', top: '-200px', left: '-200px', animation: 'glowPulse 10s infinite'
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px', background: 'var(--accent-glow-strong)',
        filter: 'blur(120px)', borderRadius: '50%', bottom: '-200px', right: '-100px', animation: 'glowPulse 15s infinite reverse'
      }} />

      <div className="glass" style={{
        padding: '40px', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px',
        zIndex: 1, animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--text-primary)' }}>ChatApp</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{isLogin ? 'Welcome back!' : 'Create an account'}</p>
        </div>

        {error && <div style={{ background: 'rgba(247, 112, 111, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input
              type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
            />
          )}
          <input
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <input
            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button className="btn-ghost" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '16px' }}>
          Demo: alice@demo.com / demo1234
        </p>
      </div>
    </div>
  );
}
