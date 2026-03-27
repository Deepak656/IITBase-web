'use client';

import { useState, useRef, useEffect } from 'react';
import {authApi} from '../../lib/authApi';

type Step = 'email' | 'otp' | 'success';

export default function PasswordResetPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [mounted, setMounted] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordStrength = (() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][passwordStrength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][passwordStrength];

  const handleRequestOtp = async () => {
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      await authApi.auth.requestPasswordOtp(email);
      setStep('otp');
      startResendCooldown();
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError('Enter the 6-digit code sent to your email'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.auth.resetPassword(email, otpValue, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await authApi.auth.resendOtp(email, 'RESET_PASSWORD');
      startResendCooldown();
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && index === 5 && otp[5]) handleResetPassword();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-root {
          min-height: 100vh;
          background: #0a0f1e;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .rp-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .rp-bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          pointer-events: none;
        }

        .rp-bg-glow-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }

        .rp-left {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 1024px) {
          .rp-left { display: flex; }
        }

        .rp-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rp-logo-mark {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: white;
        }

        .rp-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 500;
          color: #f8fafc;
          letter-spacing: -0.3px;
        }

        .rp-left-body {
          padding-bottom: 40px;
        }

        .rp-left-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 20px;
        }

        .rp-left-heading {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 500;
          color: #f8fafc;
          line-height: 1.2;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
        }

        .rp-left-subtext {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }

        .rp-trust-pills {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rp-trust-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }

        .rp-trust-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rp-trust-pill-text {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 400;
        }

        .rp-trust-pill-text strong {
          display: block;
          color: #cbd5e1;
          font-weight: 500;
          font-size: 13px;
          margin-bottom: 1px;
        }

        .rp-right {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .rp-card {
          width: 100%;
          max-width: 440px;
          background: rgba(15, 20, 40, 0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 44px;
          backdrop-filter: blur(20px);
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(12px)'};
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .rp-step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .rp-step-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s ease;
        }

        .rp-step-dot.active {
          width: 20px;
          border-radius: 3px;
          background: #6366f1;
        }

        .rp-step-dot.done {
          background: #10b981;
        }

        .rp-card-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 10px;
        }

        .rp-card-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 500;
          color: #f8fafc;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .rp-card-sub {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 32px;
          line-height: 1.6;
          font-weight: 300;
        }

        .rp-field {
          margin-bottom: 20px;
        }

        .rp-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .rp-input-wrap {
          position: relative;
        }

        .rp-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-size: 15px;
          color: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .rp-input::placeholder { color: #334155; }

        .rp-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
        }

        .rp-input-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #475569;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
          display: flex;
        }

        .rp-input-icon:hover { color: #94a3b8; }

        .rp-input.has-icon { padding-right: 44px; }

        .rp-strength-bar {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }

        .rp-strength-seg {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s ease;
        }

        .rp-strength-label {
          font-size: 11px;
          color: #64748b;
          margin-top: 5px;
          text-align: right;
          transition: color 0.3s;
        }

        .rp-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }

        .rp-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          color: white;
          box-shadow: 0 4px 24px rgba(99,102,241,0.25);
        }

        .rp-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.35);
        }

        .rp-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .rp-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none !important;
        }

        .rp-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .rp-error svg { flex-shrink: 0; margin-top: 1px; }

        .rp-error-text {
          font-size: 13px;
          color: #fca5a5;
          line-height: 1.5;
        }

        .rp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .rp-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .rp-divider-text {
          font-size: 12px;
          color: #334155;
        }

        .rp-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
          text-decoration: none;
          margin-top: 20px;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        .rp-back:hover { color: #94a3b8; }

        /* OTP grid */
        .rp-otp-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }

        .rp-otp-input {
          aspect-ratio: 1;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
          padding: 0;
        }

        .rp-otp-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.06);
        }

        .rp-otp-input.filled {
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
        }

        .rp-resend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
        }

        .rp-resend-text {
          font-size: 13px;
          color: #475569;
        }

        .rp-resend-btn {
          font-size: 13px;
          color: #6366f1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }

        .rp-resend-btn:hover:not(:disabled) { color: #818cf8; }
        .rp-resend-btn:disabled { color: #334155; cursor: not-allowed; }

        /* Success */
        .rp-success-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .rp-success-heading {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 500;
          color: #f8fafc;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }

        .rp-success-sub {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 32px;
          font-weight: 300;
        }

        .rp-footer-note {
          text-align: center;
          font-size: 12px;
          color: #1e293b;
          margin-top: 28px;
        }

        .rp-footer-note a {
          color: #334155;
          text-decoration: none;
          transition: color 0.2s;
        }

        .rp-footer-note a:hover { color: #475569; }

        @media (max-width: 480px) {
          .rp-card { padding: 32px 24px; }
          .rp-otp-input { font-size: 16px; }
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-bg-grid" />
        <div className="rp-bg-glow" />
        <div className="rp-bg-glow-2" />

        {/* Left panel */}
        <div className="rp-left">
          <div className="rp-logo">
            <div className="rp-logo-mark">I</div>
            <span className="rp-logo-text">IITBase</span>
          </div>

          <div className="rp-left-body">
            <div className="rp-left-eyebrow">Account Security</div>
            <h2 className="rp-left-heading">
              Your credentials<br />are in safe hands.
            </h2>
            <p className="rp-left-subtext">
              Password resets are verified via OTP and all active sessions are invalidated automatically to keep your account secure.
            </p>
          </div>

          <div className="rp-trust-pills">
            {[
              { icon: '🔐', title: 'End-to-end encrypted', sub: 'All data in transit is TLS encrypted' },
              { icon: '⚡', title: 'OTP expires in 10 min', sub: 'Time-limited codes for every action' },
              { icon: '🛡️', title: 'Session invalidation', sub: 'All devices are signed out on change' },
            ].map(p => (
              <div key={p.title} className="rp-trust-pill">
                <div className="rp-trust-icon" style={{ fontSize: 18 }}>{p.icon}</div>
                <div className="rp-trust-pill-text">
                  <strong>{p.title}</strong>
                  {p.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="rp-right">
          <div>
            <div className="rp-card">
              {/* Step dots */}
              <div className="rp-step-indicator">
                {(['email', 'otp', 'success'] as Step[]).map((s) => (
                  <div
                    key={s}
                    className={`rp-step-dot ${step === s ? 'active' : (
                      (s === 'email' && (step === 'otp' || step === 'success')) ||
                      (s === 'otp' && step === 'success') ? 'done' : ''
                    )}`}
                  />
                ))}
              </div>

              {error && (
                <div className="rp-error">
                  <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="rp-error-text">{error}</p>
                </div>
              )}

              {/* Step 1: Email */}
              {step === 'email' && (
                <>
                  <div className="rp-card-eyebrow">Step 1 of 2</div>
                  <h1 className="rp-card-heading">Reset your password</h1>
                  <p className="rp-card-sub">
                    Enter the email linked to your account. We'll send a one-time code.
                  </p>

                  <div className="rp-field">
                    <label className="rp-label">Email address</label>
                    <input
                      className="rp-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRequestOtp()}
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </div>

                  <button
                    className="rp-btn rp-btn-primary"
                    onClick={handleRequestOtp}
                    disabled={loading || !email}
                  >
                    {loading ? 'Sending…' : 'Send reset code →'}
                  </button>

                  <button className="rp-back" onClick={() => window.location.href = '/login'}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to login
                  </button>
                </>
              )}

              {/* Step 2: OTP + New password */}
              {step === 'otp' && (
                <>
                  <div className="rp-card-eyebrow">Step 2 of 2</div>
                  <h1 className="rp-card-heading">Verify & set password</h1>
                  <p className="rp-card-sub">
                    We sent a 6-digit code to <strong style={{ color: '#94a3b8' }}>{email}</strong>
                  </p>

                  <div className="rp-otp-grid" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        className={`rp-otp-input${digit ? ' filled' : ''}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">New password</label>
                    <div className="rp-input-wrap">
                      <input
                        className="rp-input has-icon"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                      />
                      <button className="rp-input-icon" onClick={() => setShowPassword(p => !p)} type="button">
                        {showPassword
                          ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {newPassword && (
                      <>
                        <div className="rp-strength-bar">
                          {[1,2,3,4,5].map(i => (
                            <div
                              key={i}
                              className="rp-strength-seg"
                              style={{ background: i <= passwordStrength ? strengthColor : undefined }}
                            />
                          ))}
                        </div>
                        <div className="rp-strength-label" style={{ color: strengthColor }}>{strengthLabel}</div>
                      </>
                    )}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Confirm password</label>
                    <div className="rp-input-wrap">
                      <input
                        className="rp-input has-icon"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                        placeholder="Re-enter your password"
                      />
                      <button className="rp-input-icon" onClick={() => setShowConfirm(p => !p)} type="button">
                        {showConfirm
                          ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>Passwords don't match</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                      <p style={{ fontSize: 11, color: '#10b981', marginTop: 5 }}>✓ Passwords match</p>
                    )}
                  </div>

                  <button
                    className="rp-btn rp-btn-primary"
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? 'Resetting…' : 'Reset password →'}
                  </button>

                  <div className="rp-resend-row">
                    <span className="rp-resend-text">Didn't receive it?</span>
                    <button
                      className="rp-resend-btn"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>

                  <div className="rp-divider">
                    <div className="rp-divider-line" />
                    <span className="rp-divider-text">or</span>
                    <div className="rp-divider-line" />
                  </div>

                  <button
                    className="rp-back"
                    onClick={() => { setStep('email'); setOtp(['','','','','','']); }}
                  >
                    Change email address
                  </button>
                </>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="rp-success-icon" style={{ margin: '0 auto 24px' }}>
                    <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2 className="rp-success-heading">Password updated</h2>
                  <p className="rp-success-sub">
                    Your password has been changed and all active sessions have been signed out for security.
                  </p>
                  <a href="/login" className="rp-btn rp-btn-primary" style={{ textDecoration: 'none', display: 'block', lineHeight: '1', paddingTop: 16, paddingBottom: 16 }}>
                    Continue to login →
                  </a>
                </div>
              )}
            </div>

            <p className="rp-footer-note">
              Need help? <a href="mailto:hello@iitbase.com">hello@iitbase.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}