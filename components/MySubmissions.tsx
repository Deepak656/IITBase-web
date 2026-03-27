'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { communityJobsApi } from '../lib/communityJobsApi';
import type { Job, MyJobsResponse, MyJobsStatsResponse } from '../types/job';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING:      'app-badge app-badge-pending',
  APPROVED:     'app-badge app-badge-approved',
  REJECTED:     'app-badge app-badge-rejected',
  UNDER_REVIEW: 'app-badge app-badge-review',
  EXPIRED:      'app-badge app-badge-expired',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', APPROVED: 'Approved',
  REJECTED: 'Rejected', UNDER_REVIEW: 'Under review', EXPIRED: 'Expired',
};

function SubmissionCard({ job }: { job: Job }) {
  const router = useRouter();
  const roleDisplay = job.roleTitle ?? job.jobDomain?.replace(/_/g, ' ') ?? '';

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--app-border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.title}
          </p>
          <p style={{ fontSize: 13, color: 'var(--app-text-muted)', margin: 0, fontWeight: 300 }}>
            {job.company} · {job.location}
          </p>
        </div>
        <span className={STATUS_BADGE[job.status ?? ''] ?? 'app-badge'} style={{ flexShrink: 0, fontSize: 11 }}>
          {STATUS_LABEL[job.status ?? ''] ?? job.status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="app-tag" style={{ fontSize: 11 }}>{roleDisplay}</span>
        <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
          {job.minExperience}–{job.maxExperience} yrs
        </span>
        <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
          {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {job.techStack && job.techStack.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {job.techStack.slice(0, 5).map(t => (
            <span key={t} className="app-tag" style={{ fontSize: 11 }}>{t}</span>
          ))}
          {job.techStack.length > 5 && (
            <span style={{ fontSize: 11, color: 'var(--app-text-faint)', padding: '3px 6px' }}>
              +{job.techStack.length - 5}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="app-btn app-btn-secondary app-btn-sm"
        >
          View details
        </button>
        {job.applyUrl && (
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
            className="app-btn app-btn-ghost app-btn-sm" style={{ textDecoration: 'none' }}>
            View listing ↗
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    communityJobsApi.jobs.mySubmissionsStats()
      .then(setStats).catch(() => {}).finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    communityJobsApi.jobs.mySubmissions({
      statuses: statusFilter === 'ALL' ? undefined : [statusFilter],
      page: currentPage, size: 20,
    }).then(setMyJobsData).catch(() => setMyJobsData(null)).finally(() => setLoading(false));
  }, [statusFilter, currentPage]);

  const jobs = myJobsData?.jobs ?? [];
  const totalPages = myJobsData?.totalPages ?? 0;

  const STAT_ITEMS = [
    { label: 'Total',    value: stats?.total,      color: 'var(--app-accent)' },
    { label: 'Approved', value: stats?.approved,   color: 'var(--app-green)' },
    { label: 'Pending',  value: stats?.pending,    color: 'var(--app-amber)' },
    { label: 'Rejected', value: stats?.rejected,   color: 'var(--app-red)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {STAT_ITEMS.map(item => (
          <div key={item.label} className="app-card" style={{ padding: '16px 20px' }}>
            <div style={{ width: 28, height: 3, borderRadius: 2, background: item.color, marginBottom: 12 }} />
            {statsLoading
              ? <div className="app-skeleton" style={{ height: 24, width: '40%', marginBottom: 6 }} />
              : <p style={{ fontFamily: 'var(--app-font-display)', fontSize: 26, fontWeight: 500, color: 'var(--app-text-primary)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                  {item.value ?? 0}
                </p>
            }
            <p style={{ fontSize: 13, color: 'var(--app-text-muted)', fontWeight: 300, margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="app-section">
        <div className="app-section-header">
          <div>
            <span className="app-section-title">My submissions</span>
            <p style={{ fontSize: 12, color: 'var(--app-text-faint)', marginTop: 3 }}>
              Track opportunities you've shared with the community
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(0); }}
                className={`app-filter-chip${statusFilter === s ? ' active' : ''}`}
                style={{ fontSize: 12 }}
              >
                {s === 'ALL' ? 'All' : STATUS_LABEL[s]}
                {s !== 'ALL' && stats && (
                  <span style={{ marginLeft: 5, opacity: 0.7 }}>
                    {s === 'PENDING' ? stats.pending
                     : s === 'APPROVED' ? stats.approved
                     : s === 'REJECTED' ? stats.rejected
                     : stats.underReview ?? 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="app-section-body">
          {loading ? (
            <div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--app-border)' }}>
                  <div className="app-skeleton" style={{ height: 14, width: '55%', marginBottom: 8 }} />
                  <div className="app-skeleton" style={{ height: 11, width: '35%' }} />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="app-empty" style={{ padding: '40px 0' }}>
              <div className="app-empty-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="app-empty-title">
                {statusFilter === 'ALL' ? 'No submissions yet' : `No ${STATUS_LABEL[statusFilter]?.toLowerCase()} submissions`}
              </p>
              <p className="app-empty-sub">
                {statusFilter === 'ALL' ? 'Share the first opportunity with your IIT community' : 'Try a different filter'}
              </p>
              {statusFilter === 'ALL' && (
                <button className="app-btn app-btn-primary" onClick={() => router.push('/share-opportunity')}>
                  Share an opportunity
                </button>
              )}
            </div>
          ) : (
            jobs.map(job => <SubmissionCard key={job.id} job={job} />)
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: '1px solid var(--app-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>Page {currentPage + 1} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="app-btn app-btn-secondary app-btn-sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                ← Prev
              </button>
              <button className="app-btn app-btn-secondary app-btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}