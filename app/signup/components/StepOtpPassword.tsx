'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function StepOtpPassword({
  email,
  role,
  onVerified,
}: {
  email: string;
  role: Role;
  onVerified: (data: any) => void;
}) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------- OTP helpers ---------- */

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // only 0–9, single digit

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    // auto-focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    const nextOtp = pasted.split('');
    while (nextOtp.length < 6) nextOtp.push('');
    setOtp(nextOtp);

    document.getElementById(
      `otp-${Math.min(pasted.length, 5)}`
    )?.focus();
  };

  /* ---------- Submit ---------- */

  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.auth.verifySignupOtp(otpValue, {
        email,
        password,
        role,
      });

      onVerified(res);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border">
      <h2 className="text-xl font-bold text-center mb-2">
        Verify your email
      </h2>

      <p className="text-center text-slate-600 text-sm mb-6">
        Enter the 6-digit code sent to <br />
        <span className="font-medium text-slate-900">{email}</span>
      </p>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={handleOtpPaste}
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-14 text-center text-xl font-bold
                       border-2 rounded-xl
                       border-slate-300
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                       outline-none"
          />
        ))}
      </div>

      {/* Passwords */}
      <input
        type="password"
        placeholder="Create password (min 8 chars)"
        className="input mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Repeat password"
        className="input mb-4"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold
                   hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Create account'}
      </button>
    </div>
  );
}
