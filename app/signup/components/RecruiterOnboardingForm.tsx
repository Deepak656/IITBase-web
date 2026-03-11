// app/signup/components/RecruiterOnboardingForm.tsx
'use client';

import { useState } from 'react';

export default function RecruiterOnboardingForm({
  userId,
  onComplete,
}: {
  userId: number;
  onComplete: () => void;
}) {
  const [form, setForm] = useState({
    fullName: '',
    designation: '',
    companyName: '',
    companySize: '',
  });

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Hiring profile
      </h2>
      <p className="text-slate-600 mb-6">
        This helps candidates trust your job listings
      </p>

      <div className="space-y-4">
        <input
          className="input"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Designation (e.g. Hiring Manager)"
          value={form.designation}
          onChange={(e) =>
            setForm({ ...form, designation: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Company name"
          value={form.companyName}
          onChange={(e) =>
            setForm({ ...form, companyName: e.target.value })
          }
        />

        <select
          className="input"
          value={form.companySize}
          onChange={(e) =>
            setForm({ ...form, companySize: e.target.value })
          }
        >
          <option value="">Company size</option>
          <option value="1-10">1–10 employees</option>
          <option value="11-50">11–50 employees</option>
          <option value="51-200">51–200 employees</option>
          <option value="200+">200+ employees</option>
        </select>
      </div>

      <button
        onClick={onComplete}
        className="w-full mt-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Continue
      </button>
    </div>
  );
}
