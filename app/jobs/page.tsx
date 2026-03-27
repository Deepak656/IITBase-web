'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { feedApi, type JobFeedItem, type JobDomain, type TechRole, type JobSource } from '../../lib/recruiterApi';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtEnum(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

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

// ── Source badge ──────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: JobSource }) {
  const cfg = {
    COMMUNITY:          { label: 'Community',   cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    RECRUITER_EXTERNAL: { label: 'Verified',    cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    RECRUITER_DIRECT:   { label: 'Easy Apply',  cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  }[source];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${cfg.cls}`}>
      {source === 'RECRUITER_DIRECT' ? '✅ ' : ''}{cfg.label}
    </span>
  );
}

// ── Single job card ───────────────────────────────────────────────────────────
function JobCard({ job }: { job: JobFeedItem }) {
  const router = useRouter();
  const salary = fmtSalary(job.salaryMin, job.salaryMax, job.currency);

  const handleClick = () => {
    // Pass source in query so detail page knows which API to call
    router.push(`/jobs/${job.id}?source=${job.source}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">
              {job.title}
            </h3>
            <SourceBadge source={job.source} />
            {job.verifiedCompany && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>

          {/* Company + meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
            <span className="font-medium text-gray-800">{job.company}</span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {job.location ?? 'Remote'}
            </span>
            <span className="text-gray-300">•</span>
            <span>{job.minExperience}–{job.maxExperience} yrs</span>
            {salary && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-green-700 font-medium">{salary}</span>
              </>
            )}
          </div>

          {/* Domain + role */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
              {fmtEnum(job.jobDomain)}
            </span>
            {job.techRole && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                {fmtEnum(job.techRole)}
              </span>
            )}
          </div>

          {/* Tech stack */}
          {job.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.techStack.slice(0, 5).map(t => (
                <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  {t}
                </span>
              ))}
              {job.techStack.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">
                  +{job.techStack.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right — CTA + date */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400">{job.createdAt}</span>
          {job.easyApply ? (
            <span className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md whitespace-nowrap">
              Apply on IITBase
            </span>
          ) : (
            <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md whitespace-nowrap">
              View Job →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Filters sidebar ───────────────────────────────────────────────────────────
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

interface Filters {
  domain: JobDomain | '';
  techRole: TechRole | '';
  source: JobSource | '';
  minExperience: string;
  maxExperience: string;
  location: string;
}

function FeedFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  const hasActive = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasActive && (
          <button onClick={onReset} className="text-xs text-blue-600 hover:text-blue-700">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Source */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Job type
          </label>
          <div className="space-y-1.5">
            {([
              ['', 'All jobs'],
              ['COMMUNITY', 'Community listings'],
              ['RECRUITER_DIRECT', '✅ Easy Apply'],
              ['RECRUITER_EXTERNAL', '🔗 External'],
            ] as [string, string][]).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  checked={filters.source === val}
                  onChange={() => set('source', val as JobSource | '')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Domain */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Domain
          </label>
          <select
            value={filters.domain}
            onChange={e => {
              set('domain', e.target.value as JobDomain | '');
              set('techRole', '');
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All domains</option>
            {DOMAINS.map(d => <option key={d} value={d}>{fmtEnum(d)}</option>)}
          </select>
        </div>

        {/* Tech role — only when TECHNOLOGY domain */}
        {filters.domain === 'TECHNOLOGY' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Tech role
            </label>
            <select
              value={filters.techRole}
              onChange={e => set('techRole', e.target.value as TechRole | '')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All roles</option>
              {TECH_ROLES.map(r => <option key={r} value={r}>{fmtEnum(r)}</option>)}
            </select>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Location
          </label>
          <input
            value={filters.location}
            onChange={e => set('location', e.target.value)}
            placeholder="e.g. Bangalore"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Experience */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Experience (years)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number" min={0}
              value={filters.minExperience}
              onChange={e => set('minExperience', e.target.value)}
              placeholder="Min"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number" min={0}
              value={filters.maxExperience}
              onChange={e => set('maxExperience', e.target.value)}
              placeholder="Max"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const EMPTY_FILTERS: Filters = {
  domain: '', techRole: '', source: '',
  minExperience: '', maxExperience: '', location: '',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await feedApi.get({
        domain:        filters.domain || undefined,
        techRole:      filters.techRole || undefined,
        source:        filters.source || undefined,
        minExperience: filters.minExperience ? Number(filters.minExperience) : undefined,
        maxExperience: filters.maxExperience ? Number(filters.maxExperience) : undefined,
        location:      filters.location || undefined,
        page,
        size: 20,
      });
      setJobs(response.jobs ?? []);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleFilterChange = (f: Filters) => {
    setFilters(f);
    setPage(0);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-gray-600">
              {loading
                ? 'Loading…'
                : `${totalItems} ${totalItems === 1 ? 'opportunity' : 'opportunities'} available`}
            </p>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                Easy Apply — apply directly on IITBase
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Verified company listing
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Filters */}
          <div className="lg:col-span-1">
            <FeedFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => { setFilters(EMPTY_FILTERS); setPage(0); }}
            />
          </div>

          {/* Job list */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-6 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more opportunities</p>
                <button
                  onClick={() => { setFilters(EMPTY_FILTERS); setPage(0); }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map(job => <JobCard key={`${job.source}-${job.id}`} job={job} />)}
                </div>

                {/* Pagination — matching your existing style exactly */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const pageNum = i + Math.max(0, page - 2);
                        if (pageNum >= totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}