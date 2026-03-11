// JobSeekerOnboardingForm.tsx
'use client';

export default function JobSeekerOnboardingForm({
  userId,
  onComplete,
}: {
  userId: number;
  onComplete: () => void;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border">
      <h2 className="text-xl font-bold mb-6">Your professional profile</h2>

      <input placeholder="Full name" className="input" />
      <input placeholder="Designation" className="input" />
      <input placeholder="University" className="input" />
      <select className="input">
        <option>0–1 years</option>
        <option>1–3 years</option>
        <option>3–5 years</option>
      </select>

      <button
        onClick={onComplete}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl"
      >
        Save & continue
      </button>
    </div>
  );
}
