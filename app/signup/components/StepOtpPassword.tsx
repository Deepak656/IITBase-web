'use client';

import { useState, useRef } from 'react';
import { authApi } from '../../../lib/authApi';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function StepOtpPassword({
  email,
  role,
  onVerified,
  onBack,
}: {
  email: string;
  role: Role;
  onVerified: (data: any) => void;
  onBack?: () => void;
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown on mount (OTP was sent by parent before rendering this step)
  useState(() => {
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.auth.requestSignupOtp(email);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startResendCooldown();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const d = val.slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const prev = [...otp];
      prev[i - 1] = '';
      setOtp(prev);
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Password strength
  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][passwordStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][passwordStrength];

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError('Enter the complete 6-digit code'); return; }
    if (password.length < 8)   { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm)  { setError('Passwords do not match'); return; }

    setError('');
    setLoading(true);
    try {
      const res = await authApi.auth.verifySignupOtp(otpValue, { email, password, role });
      onVerified(res);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
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
  );

  return (
    <>
      <div className="auth-eyebrow">Step 2 of 2</div>
      <h1 className="auth-heading">Verify & secure</h1>
      <p className="auth-subtext">
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below and set your password.
      </p>

      {error && (
        <div className="auth-error">
          <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          <p className="auth-error-text">{error}</p>
        </div>
      )}

      {/* OTP */}
      <div className="auth-otp-grid" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { otpRefs.current[i] = el; }}
            className={`auth-otp-input${digit ? ' filled' : ''}`}
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

      {/* Password */}
      <label className="auth-label">Create password</label>
      <div className="auth-input-wrap">
        <input
          className="auth-input"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="auth-input-icon-btn"
          onClick={() => setShowPassword(p => !p)}
          type="button"
          tabIndex={-1}
        >
          <EyeIcon open={showPassword} />
        </button>
      </div>

      {password && (
        <>
          <div className="auth-strength-bar">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className="auth-strength-seg"
                style={{ background: i <= passwordStrength ? strengthColor : undefined }}
              />
            ))}
          </div>
          <div className="auth-strength-label" style={{ color: strengthColor }}>
            {strengthLabel}
          </div>
        </>
      )}

      {/* Confirm */}
      <label className="auth-label">Confirm password</label>
      <div className="auth-input-wrap">
        <input
          className="auth-input"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />
        <button
          className="auth-input-icon-btn"
          onClick={() => setShowConfirm(p => !p)}
          type="button"
          tabIndex={-1}
        >
          <EyeIcon open={showConfirm} />
        </button>
      </div>

      {confirm && password !== confirm && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: -10, marginBottom: 12 }}>
          Passwords don't match
        </p>
      )}
      {confirm && password === confirm && password.length >= 8 && (
        <p style={{ fontSize: 11, color: '#10b981', marginTop: -10, marginBottom: 12 }}>
          ✓ Passwords match
        </p>
      )}

      <button
        className="auth-btn auth-btn-primary"
        onClick={handleVerify}
        disabled={loading}
        style={{ marginTop: 8 }}
      >
        {loading ? 'Creating account…' : 'Create account →'}
      </button>

      <div className="auth-resend-row">
        <span className="auth-resend-label">Didn't receive it?</span>
        {resendCooldown > 0 ? (
          <span className="auth-cooldown-pill">
            <span className="auth-cooldown-dot" />
            Resend in {resendCooldown}s
          </span>
        ) : (
          <button className="auth-resend-btn" onClick={handleResend}>
            Resend code
          </button>
        )}
      </div>

      {onBack && (
        <button
          className="auth-btn auth-btn-ghost"
          onClick={onBack}
          style={{ marginTop: 16 }}
        >
          ← Change email
        </button>
      )}
    </>
  );
}