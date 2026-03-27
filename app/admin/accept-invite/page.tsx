'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi } from '../../../lib/adminApi';
import { setToken } from '../../../lib/auth';
import { useAuth } from '../../../context/AuthContext';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refreshAuth } = useAuth();

  const token = searchParams.get('token') ?? '';

  type PageState = 'loading' | 'valid' | 'invalid' | 'success';

  const [pageState, setPageState]     = useState<PageState>('loading');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedBy, setInvitedBy]     = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [saving, setSaving]           = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) { setPageState('invalid'); return; }

    adminApi.staff.validateToken(token)
      .then(invite => {
        setInviteEmail(invite.email);
        setInvitedBy(invite.invitedByEmail);
        setPageState('valid');
      })
      .catch(() => setPageState('invalid'));
  }, [token]);

  const handleAccept = async () => {
    setError('');

    // If they're already logged in with the right account → no password needed
    // If they have an existing account but aren't logged in → no password needed
    // If they're new → password required (backend will tell them)

    setSaving(true);
    try {
      const res = await adminApi.staff.acceptInvite({
        token,
        password: password || undefined,
      });

      // Store the JWT and update auth context
      setToken(res.token);
      await refreshAuth();

      setPageState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invite';
      // If password was required, the backend returns a clear message
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .si-root {
          min-height: 100vh; background: #0a0f1e;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px; font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        .si-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }

        .si-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          top: -150px; right: -100px; pointer-events: none;
        }

        .si-wrap { width: 100%; max-width: 460px; position: relative; z-index: 1; }

        .si-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 32px; justify-content: center;
        }

        .si-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 9px; display: flex; align-items: center;
          justify-content: center; font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 600; color: white;
        }

        .si-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 500; color: #f8fafc; letter-spacing: -0.3px;
        }

        .si-card {
          background: rgba(15, 20, 40, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 40px;
          backdrop-filter: blur(20px);
          animation: si-in 0.35s ease both;
        }

        @keyframes si-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .si-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #818cf8; margin-bottom: 8px;
        }

        .si-heading {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 500; color: #f8fafc;
          margin-bottom: 6px; letter-spacing: -0.3px; line-height: 1.3;
        }

        .si-sub {
          font-size: 14px; color: #64748b; font-weight: 300;
          line-height: 1.6; margin-bottom: 24px;
        }

        .si-sub strong { color: #94a3b8; font-weight: 500; }

        .si-info {
          display: flex; gap: 10px; padding: 12px 14px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px; margin-bottom: 22px;
        }

        .si-info-text { font-size: 13px; color: #a5b4fc; line-height: 1.5; font-weight: 300; }
        .si-info-text strong { color: #c7d2fe; font-weight: 500; }

        .si-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; margin-bottom: 18px;
        }

        .si-error-text { font-size: 13px; color: #fca5a5; line-height: 1.5; }

        .si-label {
          display: block; font-size: 12px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 7px;
        }

        .si-input-wrap { position: relative; margin-bottom: 18px; }

        .si-input {
          width: 100%; padding: 12px 44px 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .si-input::placeholder { color: #334155; }

        .si-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
        }

        .si-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #475569; display: flex; transition: color 0.15s;
        }

        .si-eye:hover { color: #94a3b8; }

        .si-hint {
          font-size: 12px; color: #334155; margin-top: -12px; margin-bottom: 18px;
          font-weight: 300;
        }

        .si-btn {
          width: 100%; padding: 13px; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.25);
        }

        .si-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.35);
        }

        .si-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .si-success-icon {
          width: 60px; height: 60px; border-radius: 14px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }

        .si-invalid-icon {
          width: 60px; height: 60px; border-radius: 14px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
      `}</style>

      <div className="si-root">
        <div className="si-grid" />
        <div className="si-glow" />

        <div className="si-wrap">
          <a href="/" className="si-logo">
            <div className="si-logo-mark">I</div>
            <span className="si-logo-text">IITBase</span>
          </a>

          <div className="si-card" key={pageState}>

            {/* Loading */}
            {pageState === 'loading' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#64748b', fontSize: 14 }}>Validating invite link…</p>
              </div>
            )}

            {/* Invalid */}
            {pageState === 'invalid' && (
              <div style={{ textAlign: 'center' }}>
                <div className="si-invalid-icon">
                  <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                </div>
                <h2 className="si-heading" style={{ textAlign: 'center' }}>
                  Invalid invite link
                </h2>
                <p className="si-sub" style={{ textAlign: 'center' }}>
                  This link is invalid, expired, or has already been used. Ask your admin to send a new invite.
                </p>
                <button className="si-btn" onClick={() => router.push('/')}>
                  Go to IITBase
                </button>
              </div>
            )}

            {/* Valid — accept form */}
            {pageState === 'valid' && (
              <>
                <div className="si-eyebrow">Staff invite</div>
                <h1 className="si-heading">Join IITBase as staff</h1>
                <p className="si-sub">
                  You've been invited by <strong>{invitedBy}</strong> to join the IITBase operations team.
                </p>

                <div className="si-info">
                  <svg width="15" height="15" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                  </svg>
                  <p className="si-info-text">
                    This invite is for <strong>{inviteEmail}</strong>.
                    {isAuthenticated
                      ? ' You\'re already logged in — click accept to get staff access.'
                      : ' If you already have an account with this email, you don\'t need a password.'
                    }
                  </p>
                </div>

                {error && (
                  <div className="si-error">
                    <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                    </svg>
                    <p className="si-error-text">{error}</p>
                  </div>
                )}

                {/* Password — only shown if they might be new */}
                {!isAuthenticated && (
                  <>
                    <label className="si-label">
                      Password <span style={{ color: '#475569', fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(only if creating a new account)</span>
                    </label>
                    <div className="si-input-wrap">
                      <input
                        className="si-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Leave blank if you have an existing account"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAccept()}
                        autoFocus
                      />
                      <button className="si-eye" onClick={() => setShowPassword(p => !p)} type="button" tabIndex={-1}>
                        {showPassword
                          ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    <p className="si-hint">
                      Already have an IITBase account? Leave this blank — we'll promote your existing account.
                    </p>
                  </>
                )}

                <button
                  className="si-btn"
                  onClick={handleAccept}
                  disabled={saving}
                >
                  {saving ? 'Accepting…' : 'Accept invite →'}
                </button>
              </>
            )}

            {/* Success */}
            {pageState === 'success' && (
              <div style={{ textAlign: 'center' }}>
                <div className="si-success-icon">
                  <svg width="26" height="26" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="si-heading" style={{ textAlign: 'center' }}>
                  Welcome to the team
                </h2>
                <p className="si-sub" style={{ textAlign: 'center' }}>
                  You now have staff access to IITBase. Head to the admin dashboard to get started.
                </p>
                <button
                  className="si-btn"
                  onClick={() => router.push('/admin')}
                >
                  Go to admin dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AcceptStaffInvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Loading…</p>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}