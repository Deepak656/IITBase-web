'use client';

import { useState, useRef, useEffect } from 'react';
import { authApi } from '../../lib/authApi';

type Step = 'verify-current' | 'enter-new' | 'success';

export default function ChangeEmailPage() {
  const [step, setStep] = useState<Step>('verify-current');
  const [currentEmailOtp, setCurrentEmailOtp] = useState(['', '', '', '', '', '']);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Separate cooldown timers — one per send action
  const [currentResendCooldown, setCurrentResendCooldown] = useState(0);
  const [newResendCooldown, setNewResendCooldown] = useState(0);

  const [mounted, setMounted] = useState(false);

  const currentOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP to current email on mount — backend resolves the email from JWT
  useEffect(() => {
    setMounted(true);
    sendCurrentEmailOtp();
  }, []);

  const startCooldown = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    seconds = 60
  ) => {
    setter(seconds);
    const interval = setInterval(() => {
      setter(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 1 ─────────────────────────────────────────────────────────────────

  const sendCurrentEmailOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await authApi.auth.verifyCurrentEmailRequestOtp();
      setOtpSent(true);
      startCooldown(setCurrentResendCooldown);
      console.log('[ChangeEmail] OTP sent to current email');
    } catch (err: any) {
      console.error('[ChangeEmail] Failed to send OTP to current email:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCurrentEmail = async () => {
    const otp = currentEmailOtp.join('');
    if (otp.length !== 6) { setError('Enter the 6-digit code sent to your current email'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.auth.verifyCurrentEmailOtp(otp);
      console.log('[ChangeEmail] Current email verified — proceeding to step 2');
      setStep('enter-new');
      setCurrentResendCooldown(0);
    } catch (err: any) {
      console.error('[ChangeEmail] Current email OTP failed:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 ─────────────────────────────────────────────────────────────────

  const handleRequestNewEmailOtp = async () => {
    if (!newEmail.trim()) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.auth.changeEmailRequestOtp(newEmail.trim());
      startCooldown(setNewResendCooldown);
      console.log('[ChangeEmail] OTP sent to new email:', newEmail);
    } catch (err: any) {
      console.error('[ChangeEmail] Failed to send OTP to new email:', err);
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNewEmail = async () => {
    const otp = newEmailOtp.join('');
    if (otp.length !== 6) { setError('Enter the 6-digit code sent to your new email'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.auth.changeEmailVerify(newEmail.trim(), otp);
      console.log('[ChangeEmail] Email updated successfully');
      setStep('success');
    } catch (err: any) {
      console.error('[ChangeEmail] New email OTP failed:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ──────────────────────────────────────────────────────

  const makeOtpHandler = (
    state: string[],
    setState: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => ({
    onChange: (i: number, val: string) => {
      if (!/^\d*$/.test(val)) return;
      const d = val.slice(-1);
      const next = [...state];
      next[i] = d;
      setState(next);
      if (d && i < 5) refs.current[i + 1]?.focus();
    },
    onKeyDown: (i: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !state[i] && i > 0) {
        const prev = [...state];
        prev[i - 1] = '';
        setState(prev);
        refs.current[i - 1]?.focus();
      }
    },
    onPaste: (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (text.length === 6) {
        setState(text.split(''));
        refs.current[5]?.focus();
      }
    },
  });

  const currentOtpHandlers = makeOtpHandler(currentEmailOtp, setCurrentEmailOtp, currentOtpRefs);
  const newOtpHandlers = makeOtpHandler(newEmailOtp, setNewEmailOtp, newOtpRefs);

  const OtpGrid = ({
    values,
    refs,
    handlers,
    autoFocusFirst = false,
  }: {
    values: string[];
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    handlers: ReturnType<typeof makeOtpHandler>;
    autoFocusFirst?: boolean;
  }) => (
    <div className="ce-otp-grid" onPaste={handlers.onPaste}>
      {values.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          className={`ce-otp-input${digit ? ' filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handlers.onChange(i, e.target.value)}
          onKeyDown={e => handlers.onKeyDown(i, e)}
          autoFocus={autoFocusFirst && i === 0}
        />
      ))}
    </div>
  );

  const stepOrder: Step[] = ['verify-current', 'enter-new', 'success'];
  const currentStepIdx = stepOrder.indexOf(step);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ce-root {
          min-height: 100vh; background: #0a0f1e;
          display: flex; font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .ce-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }
        .ce-bg-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
          top: -150px; right: -50px; pointer-events: none;
        }
        .ce-bg-glow-2 {
          position: absolute; width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
          bottom: -80px; left: -80px; pointer-events: none;
        }

        .ce-left {
          display: none; flex-direction: column; justify-content: space-between;
          padding: 60px; flex: 1; position: relative; z-index: 1;
        }
        @media (min-width: 1024px) { .ce-left { display: flex; } }

        .ce-logo { display: flex; align-items: center; gap: 12px; }
        .ce-logo-mark {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: white;
        }
        .ce-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 500; color: #f8fafc; letter-spacing: -0.3px;
        }
        .ce-left-body { padding-bottom: 40px; }
        .ce-left-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #10b981; margin-bottom: 20px;
        }
        .ce-left-heading {
          font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 500;
          color: #f8fafc; line-height: 1.2; margin-bottom: 20px; letter-spacing: -0.5px;
        }
        .ce-left-subtext {
          font-size: 15px; color: #64748b; line-height: 1.7; max-width: 340px; font-weight: 300;
        }

        .ce-progress { display: flex; flex-direction: column; }
        .ce-progress-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding-bottom: 28px; position: relative;
        }
        .ce-progress-item:last-child { padding-bottom: 0; }
        .ce-progress-item:not(:last-child)::after {
          content: ''; position: absolute; left: 15px; top: 32px; bottom: 0;
          width: 1px; background: rgba(255,255,255,0.07);
        }
        .ce-progress-num {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; flex-shrink: 0;
          transition: all 0.3s ease; position: relative; z-index: 1;
        }
        .ce-progress-num.pending { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #334155; }
        .ce-progress-num.active  { background: rgba(99,102,241,0.15);  border: 1px solid rgba(99,102,241,0.4);  color: #a5b4fc; }
        .ce-progress-num.done    { background: rgba(16,185,129,0.1);   border: 1px solid rgba(16,185,129,0.3);  color: #34d399; }
        .ce-progress-label { padding-top: 6px; }
        .ce-progress-label strong {
          display: block; font-size: 13px; font-weight: 500;
          color: #64748b; margin-bottom: 2px; transition: color 0.3s;
        }
        .ce-progress-item.active .ce-progress-label strong { color: #e2e8f0; }
        .ce-progress-item.done   .ce-progress-label strong { color: #475569; }
        .ce-progress-label span { font-size: 12px; color: #334155; font-weight: 300; }

        .ce-right {
          display: flex; align-items: center; justify-content: center;
          flex: 1; padding: 40px 24px; position: relative; z-index: 1;
        }
        .ce-card {
          width: 100%; max-width: 440px;
          background: rgba(15, 20, 40, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 44px;
          backdrop-filter: blur(20px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .ce-step-dots { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
        .ce-dot {
          height: 4px; border-radius: 2px; transition: all 0.3s ease;
          background: rgba(255,255,255,0.1); width: 28px;
        }
        .ce-dot.active { background: #10b981; width: 36px; }
        .ce-dot.done   { background: rgba(16,185,129,0.35); }

        .ce-card-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #10b981; margin-bottom: 10px;
        }
        .ce-card-heading {
          font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 500;
          color: #f8fafc; margin-bottom: 8px; letter-spacing: -0.3px;
        }
        .ce-card-sub {
          font-size: 14px; color: #64748b; margin-bottom: 28px; line-height: 1.6; font-weight: 300;
        }
        .ce-card-sub strong { color: #94a3b8; font-weight: 500; }

        .ce-info-box {
          display: flex; gap: 10px; padding: 12px 14px;
          background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);
          border-radius: 10px; margin-bottom: 24px;
        }
        .ce-info-text { font-size: 13px; color: #6ee7b7; line-height: 1.5; font-weight: 300; }

        .ce-otp-grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 24px;
        }
        .ce-otp-input {
          aspect-ratio: 1; text-align: center; font-size: 20px; font-weight: 600;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #f8fafc; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s; width: 100%; padding: 0;
        }
        .ce-otp-input:focus { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.05); }
        .ce-otp-input.filled { border-color: rgba(16,185,129,0.35); color: #6ee7b7; }

        .ce-label {
          display: block; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;
          color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;
        }
        .ce-input {
          width: 100%; padding: 13px 16px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          font-size: 15px; color: #f8fafc; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s;
        }
        .ce-input::placeholder { color: #334155; }
        .ce-input:focus { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); }

        .ce-btn {
          width: 100%; padding: 14px; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease; display: block;
        }
        .ce-btn-primary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white; box-shadow: 0 4px 24px rgba(16,185,129,0.2);
        }
        .ce-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(16,185,129,0.3); }
        .ce-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .ce-btn-ghost {
          background: rgba(255,255,255,0.04); color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08); margin-top: 8px;
        }
        .ce-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: #cbd5e1; }
        .ce-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

        .ce-error {
          display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; margin-bottom: 20px;
        }
        .ce-error svg { flex-shrink: 0; margin-top: 1px; }
        .ce-error-text { font-size: 13px; color: #fca5a5; line-height: 1.5; }

        .ce-resend-row {
          display: flex; align-items: center; justify-content: space-between; margin-top: 16px;
        }
        .ce-resend-text { font-size: 13px; color: #475569; }
        .ce-resend-btn {
          font-size: 13px; color: #10b981; background: none; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.2s; padding: 0;
        }
        .ce-resend-btn:hover:not(:disabled) { color: #34d399; }
        .ce-resend-btn:disabled { color: #1e3a2f; cursor: not-allowed; }

        /* Animated cooldown pill */
        .ce-cooldown-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2); border-radius: 20px;
          font-size: 12px; color: #34d399; font-weight: 500;
        }
        .ce-cooldown-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          animation: ce-pulse 1s ease-in-out infinite;
        }
        @keyframes ce-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .ce-new-email-row { display: flex; gap: 8px; align-items: stretch; margin-bottom: 8px; }
        .ce-send-otp-btn {
          padding: 0 18px; white-space: nowrap; font-size: 13px; font-weight: 500;
          background: linear-gradient(135deg, #059669, #10b981);
          color: white; border: none; border-radius: 10px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(16,185,129,0.2); flex-shrink: 0;
        }
        .ce-send-otp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16,185,129,0.3); }
        .ce-send-otp-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .ce-success-icon {
          width: 64px; height: 64px; border-radius: 16px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        }
        .ce-footer-note { text-align: center; font-size: 12px; color: #1e293b; margin-top: 28px; }
        .ce-footer-note a { color: #334155; text-decoration: none; transition: color 0.2s; }
        .ce-footer-note a:hover { color: #475569; }

        @media (max-width: 480px) {
          .ce-card { padding: 32px 24px; }
          .ce-otp-input { font-size: 16px; }
        }
      `}</style>

      <div className="ce-root">
        <div className="ce-bg-grid" />
        <div className="ce-bg-glow" />
        <div className="ce-bg-glow-2" />

        {/* ── Left panel ────────────────────────────────────────────── */}
        <div className="ce-left">
          <div className="ce-logo">
            <div className="ce-logo-mark">I</div>
            <span className="ce-logo-text">IITBase</span>
          </div>

          <div className="ce-left-body">
            <div className="ce-left-eyebrow">Account Security</div>
            <h2 className="ce-left-heading">
              Two-step email<br />verification.
            </h2>
            <p className="ce-left-subtext">
              We verify both your current and new email to prevent unauthorized changes.
              All active sessions are signed out once the change is confirmed.
            </p>
          </div>

          <div className="ce-progress">
            {[
              { label: 'Verify current email', sub: "Confirm it's really you",           stepKey: 'verify-current' as Step },
              { label: 'Verify new email',     sub: 'Confirm ownership of new address',  stepKey: 'enter-new' as Step },
              { label: 'Change applied',       sub: 'Signed out from all devices',       stepKey: 'success' as Step },
            ].map((item, idx) => {
              const itemIdx = stepOrder.indexOf(item.stepKey);
              const status = itemIdx < currentStepIdx ? 'done' : itemIdx === currentStepIdx ? 'active' : 'pending';
              return (
                <div key={item.stepKey} className={`ce-progress-item ${status}`}>
                  <div className={`ce-progress-num ${status}`}>
                    {status === 'done'
                      ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                      : idx + 1
                    }
                  </div>
                  <div className="ce-progress-label">
                    <strong>{item.label}</strong>
                    <span>{item.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────── */}
        <div className="ce-right">
          <div>
            <div
              className="ce-card"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)' }}
            >
              {/* Step dots */}
              <div className="ce-step-dots">
                {stepOrder.map((s, idx) => (
                  <div
                    key={s}
                    className={`ce-dot ${step === s ? 'active' : idx < currentStepIdx ? 'done' : ''}`}
                  />
                ))}
              </div>

              {error && (
                <div className="ce-error">
                  <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="ce-error-text">{error}</p>
                </div>
              )}

              {/* ── Step 1: Verify current email ────────────────────── */}
              {step === 'verify-current' && (
                <>
                  <div className="ce-card-eyebrow">Step 1 of 2</div>
                  <h1 className="ce-card-heading">Confirm your identity</h1>
                  <p className="ce-card-sub">
                    {otpSent
                      ? 'We sent a 6-digit code to your current email address. Enter it below.'
                      : 'We need to verify your current email before making any changes.'
                    }
                  </p>

                  {/* Before OTP is sent: show send button */}
                  {!otpSent && (
                    <>
                      <div className="ce-info-box">
                        <svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                        </svg>
                        <p className="ce-info-text">
                          {loading
                            ? 'Sending code to your current email…'
                            : 'A verification code will be sent to your current email address.'
                          }
                        </p>
                      </div>
                      <button
                        className="ce-btn ce-btn-primary"
                        style={{ marginBottom: 0 }}
                        onClick={sendCurrentEmailOtp}
                        disabled={loading}
                      >
                        {loading ? 'Sending…' : 'Send verification code →'}
                      </button>
                    </>
                  )}

                  {/* After OTP is sent: show grid + verify button */}
                  {otpSent && (
                    <>
                      <OtpGrid
                        values={currentEmailOtp}
                        refs={currentOtpRefs}
                        handlers={currentOtpHandlers}
                        autoFocusFirst
                      />

                      <button
                        className="ce-btn ce-btn-primary"
                        onClick={handleVerifyCurrentEmail}
                        disabled={loading || currentEmailOtp.join('').length !== 6}
                      >
                        {loading ? 'Verifying…' : 'Confirm identity →'}
                      </button>

                      <div className="ce-resend-row">
                        <span className="ce-resend-text">Didn't receive it?</span>
                        {currentResendCooldown > 0 ? (
                          <span className="ce-cooldown-pill">
                            <span className="ce-cooldown-dot" />
                            Resend in {currentResendCooldown}s
                          </span>
                        ) : (
                          <button
                            className="ce-resend-btn"
                            onClick={sendCurrentEmailOtp}
                            disabled={loading}
                          >
                            Resend code
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Step 2: Enter new email + OTP ───────────────────── */}
              {step === 'enter-new' && (
                <>
                  <div className="ce-card-eyebrow">Step 2 of 2</div>
                  <h1 className="ce-card-heading">Enter new email</h1>
                  <p className="ce-card-sub">
                    We'll send a verification code to your new address before applying the change.
                  </p>

                  <label className="ce-label">New email address</label>
                  <div className="ce-new-email-row">
                    <input
                      className="ce-input"
                      style={{ marginBottom: 0, flex: 1 }}
                      type="email"
                      value={newEmail}
                      onChange={e => {
                        setNewEmail(e.target.value);
                        setNewEmailOtp(['', '', '', '', '', '']);
                        setNewResendCooldown(0);
                      }}
                      placeholder="new@example.com"
                      autoFocus
                    />
                    <button
                      className="ce-send-otp-btn"
                      onClick={handleRequestNewEmailOtp}
                      disabled={loading || !newEmail.trim() || newResendCooldown > 0}
                    >
                      {loading ? '…' : newResendCooldown > 0 ? `${newResendCooldown}s` : 'Send OTP'}
                    </button>
                  </div>

                  <div style={{ marginBottom: 20, minHeight: 24 }}>
                    {newResendCooldown > 0 && (
                      <span className="ce-cooldown-pill">
                        <span className="ce-cooldown-dot" />
                        Code sent · resend in {newResendCooldown}s
                      </span>
                    )}
                    {!newResendCooldown && newEmail && (
                      <p style={{ fontSize: 12, color: '#334155' }}>
                        Enter your new email then tap "Send OTP"
                      </p>
                    )}
                  </div>

                  <OtpGrid
                    values={newEmailOtp}
                    refs={newOtpRefs}
                    handlers={newOtpHandlers}
                    autoFocusFirst={false}
                  />

                  <button
                    className="ce-btn ce-btn-primary"
                    onClick={handleVerifyNewEmail}
                    disabled={loading || newEmailOtp.join('').length !== 6}
                  >
                    {loading ? 'Applying change…' : 'Update email →'}
                  </button>

                  <button
                    className="ce-btn ce-btn-ghost"
                    onClick={() => {
                      setStep('verify-current');
                      setCurrentEmailOtp(['', '', '', '', '', '']);
                      setNewEmailOtp(['', '', '', '', '', '']);
                      setNewEmail('');
                      setOtpSent(false);
                      setNewResendCooldown(0);
                      setError('');
                    }}
                  >
                    ← Start over
                  </button>
                </>
              )}

              {/* ── Step 3: Success ──────────────────────────────────── */}
              {step === 'success' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="ce-success-icon">
                    <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 26, fontWeight: 500, color: '#f8fafc',
                    marginBottom: 10, letterSpacing: '-0.3px',
                  }}>
                    Email updated
                  </h2>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>
                    Your email has been changed to{' '}
                    <strong style={{ color: '#6ee7b7' }}>{newEmail}</strong>.{' '}
                    All active sessions have been signed out for security.
                  </p>
                  <a
                    href="/login"
                    className="ce-btn ce-btn-primary"
                    style={{ textDecoration: 'none', lineHeight: '1', paddingTop: 16, paddingBottom: 16 }}
                  >
                    Sign in with new email →
                  </a>
                </div>
              )}
            </div>

            <p className="ce-footer-note">
              Need help? <a href="mailto:hello@iitbase.com">hello@iitbase.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}