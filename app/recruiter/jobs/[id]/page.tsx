'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  recruiterJobApi,
  type JobDomain,
  type TechRole,
  type ApplyType,
  type PostJobRequest,
  type RecruiterJobStatus,
} from '../../../../lib/recruiterApi';

const DOMAINS: JobDomain[] = [
  'TECHNOLOGY', 'ANALYTICS', 'CORE_ENGINEERING', 'CONSULTING',
  'FINANCE', 'PRODUCT', 'RESEARCH', 'DESIGN', 'OPERATIONS',
  'ENTREPRENEURSHIP', 'POLICY', 'OTHER',
];
const TECH_ROLES: TechRole[] = [
  'BACKEND_ENGINEER', 'FRONTEND_ENGINEER', 'FULL_STACK_ENGINEER',
  'MOBILE_ENGINEER', 'DEVOPS_ENGINEER', 'PLATFORM_ENGINEER',
  'SITE_RELIABILITY_ENGINEER', 'SECURITY_ENGINEER', 'QA_ENGINEER',
  'EMBEDDED_ENGINEER', 'SOLUTIONS_ARCHITECT', 'ENGINEERING_MANAGER', 'OTHER',
];

function fmtEnum(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function TagInput({ tags, onChange, placeholder }: {
  tags: string[]; onChange: (t: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };
  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-teal-500">
      {tags.map(t => (
        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-md border border-teal-200">
          {t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
      />
    </div>
  );
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<RecruiterJobStatus>('ACTIVE');

  const [form, setForm] = useState<PostJobRequest>({
    title: '', roleTitle: '', jobDomain: 'TECHNOLOGY', techRole: undefined,
    location: '', jobDescription: '', minExperience: 0, maxExperience: 3,
    applyType: 'INTERNAL', applyUrl: undefined, salaryMin: undefined,
    salaryMax: undefined, currency: 'INR', techStack: [], skills: [],
  });

  const set = <K extends keyof PostJobRequest>(k: K, v: PostJobRequest[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  // ── Fetch existing job and pre-populate ───────────────────────────────────
  useEffect(() => {
    recruiterJobApi.getById(jobId)
      .then(job => {
        setCurrentStatus(job.status);
        setForm({
          title:          job.title,
          roleTitle:      job.roleTitle,
          jobDomain:      job.jobDomain,
          techRole:       job.techRole,
          location:       job.location ?? '',
          jobDescription: job.jobDescription ?? '',
          minExperience:  job.minExperience,
          maxExperience:  job.maxExperience,
          applyType:      job.applyType,
          applyUrl:       job.applyUrl,
          salaryMin:      job.salaryMin,
          salaryMax:      job.salaryMax,
          currency:       job.currency ?? 'INR',
          techStack:      job.techStack ?? [],
          skills:         job.skills ?? [],
        });
      })
      .catch(() => setError('Failed to load job. It may have been removed.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.applyType === 'EXTERNAL' && !form.applyUrl) {
      setError('Apply URL is required for external jobs'); return;
    }
    if (form.jobDomain === 'TECHNOLOGY' && !form.techRole) {
      setError('Please select a tech role for Technology domain'); return;
    }
    setError(''); setSaving(true); setSaved(false);
    try {
      await recruiterJobApi.update(jobId, {
        ...form,
        applyUrl:  form.applyType === 'INTERNAL' ? undefined : form.applyUrl,
        techRole:  form.jobDomain === 'TECHNOLOGY' ? form.techRole : undefined,
      });
      setSaved(true);
      setTimeout(() => router.push('/recruiter/jobs'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
    } finally { setSaving(false); }
  };

  // ── Status actions (close / reopen / remove) ──────────────────────────────
const handleStatusChange = async (status: RecruiterJobStatus) => {
  const labels: Record<string, string> = {
    CLOSED:  'Close this listing?',
    ACTIVE:  'Reopen this listing?',
    REMOVED: 'Remove this listing? This cannot be undone.',
  };

  if (!confirm(labels[status])) return;

  try {
    await recruiterJobApi.updateStatus(jobId, 'CLOSED');

    setCurrentStatus(status);

    if (status === 'REMOVED') router.push('/recruiter/jobs');
  } catch {
    setError('Failed to update status');
  }
};

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-9 bg-gray-100 rounded" />
              <div className="h-9 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            ← Back to listings
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit job</h1>
              <p className="text-sm text-gray-500 mt-1">
                Changes go live immediately after saving
              </p>
            </div>
            {/* Status badge + quick actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                currentStatus === 'ACTIVE'  ? 'bg-green-50 text-green-700 border-green-200' :
                currentStatus === 'CLOSED'  ? 'bg-gray-100 text-gray-600 border-gray-200' :
                currentStatus === 'DRAFT'   ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                              'bg-red-50 text-red-600 border-red-200'
              }`}>
                {currentStatus}
              </span>
              {currentStatus === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('CLOSED')}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close listing
                </button>
              )}
              {currentStatus === 'CLOSED' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('ACTIVE')}
                  className="px-3 py-1.5 text-xs font-medium border border-teal-200 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success banner */}
        {saved && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">✓ Job updated successfully — redirecting…</p>
          </div>
        )}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic info — identical structure to new/page.tsx */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Job details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job title <span className="text-red-500">*</span>
              </label>
              <input required value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role title <span className="text-red-500">*</span>
              </label>
              <input required value={form.roleTitle}
                onChange={e => set('roleTitle', e.target.value)}
                placeholder="Human-readable role e.g. Backend Engineer"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.jobDomain}
                  onChange={e => { set('jobDomain', e.target.value as JobDomain); set('techRole', undefined); }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {DOMAINS.map(d => <option key={d} value={d}>{fmtEnum(d)}</option>)}
                </select>
              </div>

              {form.jobDomain === 'TECHNOLOGY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.techRole ?? ''}
                    onChange={e => set('techRole', e.target.value as TechRole)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select…</option>
                    {TECH_ROLES.map(r => <option key={r} value={r}>{fmtEnum(r)}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input required value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Bengaluru, India or Remote"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min experience (years) <span className="text-red-500">*</span>
                </label>
                <input required type="number" min={0} max={20}
                  value={form.minExperience}
                  onChange={e => set('minExperience', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max experience (years) <span className="text-red-500">*</span>
                </label>
                <input required type="number" min={0} max={30}
                  value={form.maxExperience}
                  onChange={e => set('maxExperience', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Apply type — note: applyType cannot be changed after posting */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                How candidates apply
              </h2>
              <span className="text-xs text-gray-400 italic">
                Apply type cannot be changed after posting
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['INTERNAL', 'EXTERNAL'] as ApplyType[]).map(t => (
                <div
                  key={t}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left ${
                    form.applyType === t
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="font-semibold mb-0.5">
                    {t === 'INTERNAL' ? '✅ Easy Apply on IITBase' : '🔗 External Link'}
                  </div>
                  <div className="text-xs font-normal opacity-70">
                    {t === 'INTERNAL'
                      ? 'Candidates apply directly — you manage pipeline here'
                      : 'Redirect to your company careers page'}
                  </div>
                </div>
              ))}
            </div>

            {form.applyType === 'EXTERNAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apply URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={form.applyUrl ?? ''}
                  onChange={e => set('applyUrl', e.target.value)}
                  placeholder="https://careers.acme.com/apply"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Salary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Compensation (optional)
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min (₹)</label>
                <input type="number"
                  value={form.salaryMin ?? ''}
                  onChange={e => set('salaryMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="800000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max (₹)</label>
                <input type="number"
                  value={form.salaryMax ?? ''}
                  onChange={e => set('salaryMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="1500000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.currency}
                  onChange={e => set('currency', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {['INR', 'USD', 'EUR', 'GBP', 'SGD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tech stack & skills */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Tech stack & skills
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tech stack</label>
              <TagInput
                tags={form.techStack ?? []}
                onChange={v => set('techStack', v)}
                placeholder="Type and press Enter — Java, Spring Boot…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <TagInput
                tags={form.skills ?? []}
                onChange={v => set('skills', v)}
                placeholder="Type and press Enter — System Design, DSA…"
              />
            </div>
          </div>

          {/* Job description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job description
            </label>
            <textarea
              rows={8}
              value={form.jobDescription}
              onChange={e => set('jobDescription', e.target.value)}
              placeholder="Describe responsibilities, requirements, and what makes this role exciting…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Danger zone */}
          {currentStatus !== 'REMOVED' && (
            <div className="bg-white rounded-xl border border-red-200 p-5">
              <h2 className="text-sm font-semibold text-red-600 mb-3">Danger zone</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Remove this listing</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permanently removes the job. Existing applications are preserved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStatusChange('REMOVED')}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 ml-4"
                >
                  Remove listing
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || currentStatus === 'REMOVED'}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}