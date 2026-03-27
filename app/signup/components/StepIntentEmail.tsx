'use client';

import { useState } from 'react';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function StepIntentEmail({
  onSubmit,
}: {
  onSubmit: (email: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>('JOB_SEEKER');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || loading) return;
    setLoading(true);
    try {
      await onSubmit(email, role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-eyebrow">Step 1 of 2</div>
      <h1 className="auth-heading">Join IITBase</h1>
      <p className="auth-subtext">
        India's professional network for IIT graduates and the companies that want to hire them.
      </p>

      {/* Role selector */}
      <div className="auth-role-grid">
        {[
          {
            id: 'JOB_SEEKER' as Role,
            icon: '🎓',
            title: 'Job Seeker',
            sub: 'IIT grad looking for opportunities',
          },
          {
            id: 'RECRUITER' as Role,
            icon: '🏢',
            title: 'Recruiter',
            sub: 'Hire from India\'s top talent pool',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setRole(item.id)}
            className={`auth-role-card${role === item.id ? ' selected' : ''}`}
          >
            <span className="auth-role-card-icon">{item.icon}</span>
            <span className="auth-role-card-title">{item.title}</span>
            <span className="auth-role-card-sub">{item.sub}</span>
          </button>
        ))}
      </div>

      {/* Email */}
      <label className="auth-label">Email address</label>
      <input
        className="auth-input"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />

      <button
        className="auth-btn auth-btn-primary"
        onClick={handleSubmit}
        disabled={!email || loading}
      >
        {loading ? 'Sending code…' : 'Continue with email →'}
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">already have an account?</span>
        <div className="auth-divider-line" />
      </div>

      <a href="/login" className="auth-btn auth-btn-ghost" style={{ textAlign: 'center' }}>
        Sign in instead
      </a>
    </>
  );
}