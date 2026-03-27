'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { communityJobsApi } from '../lib/communityJobsApi';
import type { Job, MyJobsResponse, MyJobsStatsResponse } from '../types/job';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] as const;

const STATUS_BADGE_MAP = {
  PENDING: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    label: 'Pending Review',
  },
  APPROVED: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    label: 'Approved',
  },
  REJECTED: {
    bg: 'bg-red-100',
    border: 'border-red-200',
    text: 'text-red-800',
    label: 'Rejected',
  },
  UNDER_REVIEW: {
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-800',
    label: 'Under Review',
  },
  EXPIRED: {
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-600',
    label: 'Expired',
  },
} as const;

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const badge = STATUS_BADGE_MAP[status as keyof typeof STATUS_BADGE_MAP];
  if (!badge) return null;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
    >
      {badge.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  loading,
  icon,
  iconBg,
}: {
  label: string;
  value?: number;
  loading: boolean;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-9 bg-gray-100 rounded w-16 animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value ?? 0}</p>
      )}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const router = useRouter();

  // Build the role display string from the new fields
  const roleDisplay = job.roleTitle
    ? job.roleTitle
    : job.techRole
    ? job.techRole.replace(/_/g, ' ')
    : job.jobDomain.replace(/_/g, ' ');

  return (
    <div className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {job.company} · {job.location}
          </p>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={job.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-3">
        <span>{job.minExperience}–{job.maxExperience} yrs</span>
        <span className="text-gray-300">·</span>
        <span>{roleDisplay}</span>
        <span className="text-gray-300">·</span>
        <span>
          {new Date(job.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>

      {job.techStack && job.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded border border-gray-200"
            >
              {tech}
            </span>
          ))}
          {job.techStack.length > 5 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">
              +{job.techStack.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        {job.applyUrl && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 text-sm font-medium text-teal-700 border border-teal-300 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors"
          >
            View Listing ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function MySubmissions() {
  const router = useRouter();
  const [myJobsData, setMyJobsData] = useState<MyJobsResponse | null>(null);
  const [stats, setStats] = useState<MyJobsStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadMyJobs();
  }, [statusFilter, currentPage]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await communityJobsApi.jobs.mySubmissionsStats();
      setStats(data);
    } catch {
      // non-critical — stats failing shouldn't break the page
    } finally {
      setStatsLoading(false);
    }
  };

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const data = await communityJobsApi.jobs.mySubmissions({
        statuses: statusFilter === 'ALL' ? undefined : [statusFilter],
        page: currentPage,
        size: pageSize,
      });
      setMyJobsData(data);
    } catch {
      setMyJobsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const jobs = myJobsData?.jobs ?? [];
  const totalPages = myJobsData?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats?.total}
          loading={statsLoading}
          iconBg="bg-blue-50"
          icon={
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Approved"
          value={stats?.approved}
          loading={statsLoading}
          iconBg="bg-green-50"
          icon={
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatCard
          label="Pending"
          value={stats?.pending}
          loading={statsLoading}
          iconBg="bg-yellow-50"
          icon={
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected}
          loading={statsLoading}
          iconBg="bg-red-50"
          icon={
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header + filters */}
        <div className="px-6 py-5 border-b border-gray-200 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Submissions</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Track the status of opportunities you've shared with the community
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
                {status !== 'ALL' && stats && (
                  <span className={`ml-1.5 text-xs ${statusFilter === status ? 'text-gray-300' : 'text-gray-400'}`}>
                    {status === 'PENDING' && stats.pending}
                    {status === 'APPROVED' && stats.approved}
                    {status === 'REJECTED' && stats.rejected}
                    {status === 'UNDER_REVIEW' && stats.underReview}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-5 border border-gray-200 rounded-lg animate-pulse">
                  <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-14">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {statusFilter === 'ALL'
                  ? 'No submissions yet'
                  : `No ${statusFilter.toLowerCase().replace('_', ' ')} submissions`}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {statusFilter === 'ALL'
                  ? 'Share the first opportunity with your IIT community'
                  : 'Try a different filter above'}
              </p>
              {statusFilter === 'ALL' && (
                <button
                  onClick={() => router.push('/share-opportunity')}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Share an Opportunity
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}