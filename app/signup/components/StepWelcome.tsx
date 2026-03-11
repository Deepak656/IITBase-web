// app/signup/components/StepWelcome.tsx
'use client';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function StepWelcome({
  role,
  onContinue,
  onSkip,
}: {
  role: Role;
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-3xl">👋</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-3">
        Welcome to IITBase
      </h1>

      <p className="text-slate-600 mb-8">
        {role === 'JOB_SEEKER'
          ? 'Let’s set up your professional profile'
          : 'Let’s set up your hiring profile'}
      </p>

      <button
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Continue setup
      </button>

      <button
        onClick={onContinue}
        className="mt-4 text-sm text-slate-500 hover:text-slate-700"
      >
        Skip for now
      </button>
    </div>
  );
}
