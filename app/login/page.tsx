'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../lib/authApi';
import { setToken } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.auth.login({ email, password });
      setToken(response.token);
      setUser({ email, role: response.role });

      const next = new URLSearchParams(window.location.search).get('next');
      if (response.role === 'ADMIN')      router.push(next || '/admin/jobs');
      else if (response.role === 'JOB_SEEKER') router.push(next || '/jobs');
      else if (response.role === 'RECRUITER')  router.push(next || '/recruiter');
      else router.push(next || '/profile');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-glow-top-right" />
      <div className="auth-glow-bottom-left" />

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="auth-left">
        <a href="/" className="auth-logo">
          <div className="auth-logo-mark">I</div>
          <span className="auth-logo-text">IITBase</span>
        </a>

        <div>
          <div className="auth-left-eyebrow">Welcome back</div>
          <h2 className="auth-left-heading">
            Your next role<br />is waiting.
          </h2>
          <p className="auth-left-sub">
            Sign in to access your profile, track applications, and connect with top companies hiring IIT talent.
          </p>
        </div>

        <div className="auth-trust-list">
          {[
            { icon: '🎓', title: 'IIT-verified network',    sub: 'Only top-tier talent and serious recruiters' },
            { icon: '🔒', title: 'Secure session',          sub: 'JWT-based auth with Redis session management' },
            { icon: '⚡', title: 'Direct to decision makers', sub: 'No middlemen, no ghost applications' },
          ].map(p => (
            <div key={p.title} className="auth-trust-pill">
              <div className="auth-trust-pill-icon">{p.icon}</div>
              <div className="auth-trust-pill-body">
                <strong>{p.title}</strong>
                <span>{p.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div className="auth-right">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="auth-card auth-card-enter">

            {/* No step dots on login — single step */}
            <div className="auth-eyebrow">Sign in</div>
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subtext">
              Don't have an account?{' '}
              <Link href="/signup" className="auth-link">
                Create one free →
              </Link>
            </p>

            {error && (
              <div className="auth-error">
                <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                </svg>
                <p className="auth-error-text">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="auth-label">Email address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/reset-password" className="auth-link" style={{ fontSize: 12 }}>
                  Forgot password?
                </Link>
              </div>

              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-icon-btn"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="auth-btn auth-btn-primary"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
          </div>

          <p className="auth-footer-note">
            By signing in you agree to our{' '}
            <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}