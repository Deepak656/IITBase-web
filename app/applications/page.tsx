'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applicationApi,
  type ApplicationResponse,
  type ApplicationStatus,
  type StatusHistoryItem,
} from '../../lib/recruiterApi';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  APPLIED:   { label: 'Applied',    color: 'bg-blue-50 text-blue-700 border-blue-200',    icon: '📨' },
  SCREENING: { label: 'Screening',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '🔍' },
  INTERVIEW: { label: 'Interview',  color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '📅' },
  OFFER:     { label: 'Offer',      color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🎁' },
  HIRED:     { label: 'Hired',      color: 'bg-green-50 text-green-700 border-green-200',  icon: '🎉' },
  REJECTED:  { label: 'Not selected', color: 'bg-red-50 text-red-600 border-red-200',     icon: '📩' },
  WITHDRAWN: { label: 'Withdrawn',  color: 'bg-gray-100 text-gray-500 border-gray-200',   icon: '↩️' },
};

const WITHDRAWABLE: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];

function ApplicationCard({ app, onWithdraw }: {
  app: ApplicationResponse;
  onWithdraw: (id: number) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const cfg = STATUS_CONFIG[app.status];

  const loadHistory = async () => {
    if (history.length > 0) { setExpanded(p => !p); return; }
    setLoadingHistory(true);
    try {
      const detail = await applicationApi.getMyApplicationDetail(app.id);
      setHistory(detail.history);
      setExpanded(true);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  };

  const handleWithdraw = async () => {
    if (!confirm('Withdraw this application?')) return;
    setWithdrawing(true);
    try { await onWithdraw(app.id); }
    finally { setWithdrawing(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900">{app.jobTitle}</h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{app.companyName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Applied {app.appliedAt.slice(0, 10)}
            </p>
            {app.coverNote && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">
                "{app.coverNote}"
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <a
              href={app.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              📄 Resume
            </a>
            {WITHDRAWABLE.includes(app.status) && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                {withdrawing ? 'Withdrawing…' : 'Withdraw'}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={loadHistory}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          {loadingHistory ? 'Loading…' : expanded ? '▲ Hide timeline' : '▼ Show timeline'}
        </button>
      </div>

      {/* Timeline */}
      {expanded && history.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Application timeline
          </p>
          <div className="space-y-0">
            {history.map((h, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${
                    i === 0 ? 'bg-teal-500' : 'bg-gray-300'
                  }`} />
                  {i < history.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1 mb-1" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-medium text-gray-700">
                    {h.toStatus}
                  </p>
                  {h.note && (
                    <p className="text-gray-500 mt-0.5 italic">"{h.note}"</p>
                  )}
                  <p className="text-gray-400 mt-0.5">
                    {h.changedAt.slice(0, 16).replace('T', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyApplicationsPage() {
  const [apps, setApps] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getMyApplications(page, 20);
      setApps(data.applications ?? []);
      setTotalPages(data.totalPages);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleWithdraw = async (id: number) => {
    await applicationApi.withdraw(id);
    fetchApps();
  };

  const filtered = filterStatus === 'ALL'
    ? apps
    : apps.filter(a => a.status === filterStatus);

  const statusCounts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{apps.length} total</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            All ({apps.length})
          </button>
          {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => {
            const count = statusCounts[s];
            if (!count) return null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  filterStatus === s
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label} ({count})
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3.5 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-base font-medium text-gray-700 mb-1">No applications yet</p>
            <p className="text-sm text-gray-500">
              Browse jobs and apply to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <ApplicationCard key={app.id} app={app} onWithdraw={handleWithdraw} />
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
              {page + 1} / {totalPages}
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