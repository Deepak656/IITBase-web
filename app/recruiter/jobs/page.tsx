'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  recruiterJobApi,
  type RecruiterJobResponse,
  type RecruiterJobStatus,
} from '../../../lib/recruiterApi';

const STATUS_COLORS: Record<RecruiterJobStatus, string> = {
  ACTIVE:   'bg-green-50 text-green-700 border-green-200',
  CLOSED:   'bg-gray-100 text-gray-600 border-gray-200',
  DRAFT:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  REMOVED:  'bg-red-50 text-red-600 border-red-200',
};

function fmtSalary(min?: number, max?: number, currency = 'INR') {
  if (!min && !max) return null;
  const sym = currency === 'INR' ? '₹' : currency;
  const fmt = (n: number) => n >= 100000
    ? `${sym}${(n / 100000).toFixed(1)}L`
    : `${sym}${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function JobCard({
  job,
  onRemove,
  onClose,
}: {
  job: RecruiterJobResponse;
  onRemove: (id: number) => void;
  onClose: (id: number) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const salary = fmtSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {job.title}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_COLORS[job.status]}`}>
              {job.status}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
              job.applyType === 'INTERNAL'
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {job.applyType === 'INTERNAL' ? '✅ Easy Apply' : '🔗 External'}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
            <span>📍 {job.location ?? 'Remote'}</span>
            <span>🎓 {job.minExperience}–{job.maxExperience} yrs</span>
            {salary && <span>💰 {salary}</span>}
            <span>📅 {job.createdAt.slice(0, 10)}</span>
          </div>

          {/* Tech stack */}
          {job.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {job.techStack.slice(0, 5).map(t => (
                <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                  {t}
                </span>
              ))}
              {job.techStack.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-md">
                  +{job.techStack.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {job.applyType === 'INTERNAL' && job.status === 'ACTIVE' && (
            <button
              onClick={() => router.push(`/recruiter/jobs/${job.id}/applicants`)}
              className="px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              View applicants
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => { router.push(`/recruiter/jobs/${job.id}`); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit job
                </button>
                {job.status === 'ACTIVE' && (
                  <button
                    onClick={() => { onClose(job.id); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Close listing
                  </button>
                )}
                <button
                  onClick={() => { onRemove(job.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<RecruiterJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<RecruiterJobStatus | 'ALL'>('ALL');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recruiterJobApi.getMyListings(page, 20);
      setJobs(data.jobs ?? []);
      setTotalPages(data.totalPages);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleRemove = async (id: number) => {
    if (!confirm('Remove this job listing?')) return;
    try {
      await recruiterJobApi.remove(id);
      fetchJobs();
    } catch { /* silent */ }
  };

    const handleClose = async (id: number) => {
    try {
        await recruiterJobApi.updateStatus(id, 'CLOSED');
        fetchJobs();
    } catch { /* silent */ }
    };

  const filtered = filter === 'ALL' ? jobs : jobs.filter(j => j.status === filter);

  const counts = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Job listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">{jobs.length} total listings</p>
          </div>
          <button
            onClick={() => router.push('/recruiter/jobs/new')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Post a job
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['ALL', 'ACTIVE', 'CLOSED', 'DRAFT', 'REMOVED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filter === s
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s} {s !== 'ALL' && counts[s] ? `(${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-base font-medium text-gray-700 mb-1">No job listings yet</p>
            <p className="text-sm text-gray-500 mb-5">
              Post your first job to start receiving applications
            </p>
            <button
              onClick={() => router.push('/recruiter/jobs/new')}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Post a job
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onRemove={handleRemove} onClose={handleClose} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}