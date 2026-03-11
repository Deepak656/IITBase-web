// app/signup/components/StepSuccess.tsx
'use client';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function StepSuccess({
  role,
  onFinish,
}: {
  role: Role;
  onFinish: () => void;
}) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <span className="text-3xl">✅</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-3">
        You’re all set
      </h1>

      <p className="text-slate-600 mb-8">
        {role === 'JOB_SEEKER'
          ? 'Your profile is ready. Start exploring curated roles.'
          : 'Your account is ready. Start hiring top IIT talent.'}
      </p>

      <button
        onClick={onFinish}
        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        {role === 'JOB_SEEKER' ? 'Browse jobs' : 'Post a job'}
      </button>
    </div>
  );
}
