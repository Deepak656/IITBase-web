'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { companyApi } from '../../../lib/recruiterApi';
import { useAuth } from '../../../context/AuthContext';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const token = searchParams.get('token') ?? '';

  const [name, setName]               = useState('');
  const [designation, setDesignation] = useState('');
  const [error, setError]             = useState('');
  const [saving, setSaving]           = useState(false);
  const [done, setDone]               = useState(false);

  // If not authenticated, redirect to signup with token preserved
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated && token) {
      router.replace(`/signup?invite=${token}`);
    }
  }, [isAuthenticated, authLoading, token, router]);

  if (!token) {
    return (
      <div className="ob-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔗</div>
        <h2 className="ob-heading" style={{ textAlign: 'center' }}>Invalid invite link</h2>
        <p className="ob-sub" style={{ textAlign: 'center' }}>
          This invite link is missing or malformed. Ask your admin to send a new one.
        </p>
        <button className="ob-btn-primary" onClick={() => router.push('/')}>
          Go to IITBase
        </button>
      </div>
    );
  }

  const handleAccept = async () => {
    if (!name.trim())        { setError('Full name is required'); return; }
    if (!designation.trim()) { setError('Designation is required'); return; }

    setError('');
    setSaving(true);
    try {
      await companyApi.acceptInvite({
        token,
        name: name.trim(),
        designation: designation.trim(),
      });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite. It may have expired.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ob-card" key={done ? 'done' : 'form'}>
      {done ? (
        <div style={{ textAlign: 'center' }}>
          <div className="ob-success-icon">
            <svg width="26" height="26" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="ob-heading" style={{ textAlign: 'center' }}>
            Welcome to the team
          </h2>
          <p className="ob-sub" style={{ textAlign: 'center' }}>
            You've joined the company successfully. Head to your dashboard to get started.
          </p>
          <button
            className="ob-btn-primary"
            onClick={() => router.push('/recruiter/dashboard')}
          >
            Go to dashboard →
          </button>
        </div>
      ) : (
        <>
          <div className="ob-eyebrow">You're invited</div>
          <h1 className="ob-heading">Join your team on IITBase</h1>
          <p className="ob-sub">
            You've been invited to join a company. Complete your profile to get started.
          </p>

          {error && (
            <div className="ob-error">
              <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              <p className="ob-error-text">{error}</p>
            </div>
          )}

          <label className="ob-label">Full name *</label>
          <input
            className="ob-input"
            placeholder="e.g. Priya Mehta"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />

          <label className="ob-label">Designation *</label>
          <input
            className="ob-input"
            placeholder="e.g. Technical Recruiter"
            value={designation}
            onChange={e => setDesignation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAccept()}
          />

          <button
            className="ob-btn-primary"
            onClick={handleAccept}
            disabled={saving}
          >
            {saving ? 'Joining…' : 'Accept invite →'}
          </button>
        </>
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ob-root {
          min-height: 100vh; background: #0a0f1e;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px; font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        .ob-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }

        .ob-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          top: -150px; right: -100px; pointer-events: none;
        }

        .ob-wrap {
          width: 100%; max-width: 460px; position: relative; z-index: 1;
        }

        .ob-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 32px; justify-content: center;
        }

        .ob-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 9px; display: flex; align-items: center;
          justify-content: center; font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 600; color: white;
        }

        .ob-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 500; color: #f8fafc; letter-spacing: -0.3px;
        }

        .ob-card {
          background: rgba(15, 20, 40, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 40px;
          backdrop-filter: blur(20px);
          animation: ob-in 0.35s ease both;
        }

        @keyframes ob-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ob-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #818cf8; margin-bottom: 8px;
        }

        .ob-heading {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 500; color: #f8fafc;
          margin-bottom: 6px; letter-spacing: -0.3px; line-height: 1.3;
        }

        .ob-sub {
          font-size: 14px; color: #64748b; font-weight: 300;
          line-height: 1.6; margin-bottom: 28px;
        }

        .ob-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; margin-bottom: 20px;
        }

        .ob-error-text { font-size: 13px; color: #fca5a5; line-height: 1.5; }

        .ob-label {
          display: block; font-size: 12px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 7px;
        }

        .ob-input {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s; margin-bottom: 16px;
        }

        .ob-input::placeholder { color: #334155; }

        .ob-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
        }

        .ob-btn-primary {
          width: 100%; padding: 13px; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.25);
        }

        .ob-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.35);
        }

        .ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .ob-success-icon {
          width: 60px; height: 60px; border-radius: 14px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
      `}</style>

      <div className="ob-root">
        <div className="ob-grid-bg" />
        <div className="ob-glow" />

        <div className="ob-wrap">
          <a href="/" className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <span className="ob-logo-text">IITBase</span>
          </a>

          <Suspense fallback={
            <div className="ob-card" style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: 14 }}>Loading…</p>
            </div>
          }>
            <InviteContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}