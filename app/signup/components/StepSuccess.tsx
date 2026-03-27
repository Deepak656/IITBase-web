'use client';

import { useEffect, useState } from 'react';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function StepSuccess({
  role,
  onFinish,
}: {
  role: Role;
  onFinish: () => void;
}) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown === 0) { onFinish(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onFinish]);

  const destination = role === 'JOB_SEEKER' ? 'your profile' : 'company setup';
  const progress = ((3 - countdown) / 3) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="auth-success-icon">
        <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h2 className="auth-heading" style={{ textAlign: 'center' }}>
        Welcome to IITBase
      </h2>
      <p className="auth-subtext" style={{ textAlign: 'center' }}>
        Your account is ready. Taking you to {destination} in{' '}
        <strong style={{ color: '#94a3b8' }}>{countdown}s</strong>…
      </p>

      <div className="auth-progress-track">
        <div className="auth-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <button
        className="auth-btn auth-btn-primary"
        onClick={onFinish}
      >
        {role === 'JOB_SEEKER' ? 'Set up my profile →' : 'Set up my company →'}
      </button>
    </div>
  );
}