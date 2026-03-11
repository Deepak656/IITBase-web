// StepIntentEmail.tsx
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

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border">
      <h1 className="text-3xl font-bold text-center mb-2">Join IITBase</h1>
      <p className="text-slate-600 text-center mb-8">
        Curated hiring for top-tier talent
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { id: 'JOB_SEEKER', title: 'Job Seeker', sub: 'Find top roles' },
          { id: 'RECRUITER', title: 'Recruiter', sub: 'Hire IIT talent' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setRole(item.id as Role)}
            className={`p-4 rounded-xl border text-left transition ${
              role === item.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-slate-600">{item.sub}</p>
          </button>
        ))}
      </div>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border rounded-xl mb-4"
      />

      <button
        onClick={() => onSubmit(email, role)}
        disabled={!email}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
      >
        Continue with Email
      </button>
    </div>
  );
}
