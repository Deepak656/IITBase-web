'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  inviteApi,
  type JobInviteResponse,
  type InviteStatus,
} from '../../lib/recruiterApi';

const STATUS_CONFIG: Record<InviteStatus, { label: string; color: string; icon: string }> = {
  PENDING:  { label: 'Pending',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '⏳' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200',   icon: '✅' },
  DECLINED: { label: 'Declined', color: 'bg-gray-100 text-gray-500 border-gray-200',     icon: '↩️' },
  EXPIRED:  { label: 'Expired',  color: 'bg-red-50 text-red-400 border-red-200',         icon: '⌛' },
};

function InviteCard({ invite, onDecline }: {
  invite: JobInviteResponse;
  onDecline: (id: number) => Promise<void>;
}) {
  const router = useRouter();
  const [declining, setDeclining] = useState(false);
  const cfg = STATUS_CONFIG[invite.status];

  const handleDecline = async () => {
    if (!confirm('Decline this invitation?')) return;
    setDeclining(true);
    try { await onDecline(invite.id); }
    finally { setDeclining(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-gray-900">{invite.jobTitle}</h3>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">{invite.companyName}</p>
          <p className="text-xs text-gray-400 mt-1">
            Invited {invite.createdAt.slice(0, 10)}
          </p>

          {invite.message && (
            <div className="mt-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Message from recruiter</p>
              <p className="text-sm text-gray-700 italic">"{invite.message}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {invite.status === 'PENDING' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => router.push(`/jobs/${invite.recruiterJobId}`)}
            className="flex-1 py-2 border border-teal-500 text-teal-600 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors"
          >
            View job
          </button>
          <button
            onClick={handleDecline}
            disabled={declining}
            className="px-4 py-2 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {declining ? 'Declining…' : 'Decline'}
          </button>
        </div>
      )}

      {invite.status === 'ACCEPTED' && invite.applicationId && (
        <div className="mt-4">
          <button
            onClick={() => router.push(`/applications?id=${invite.applicationId}`)}
            className="w-full py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
          >
            View your application →
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyInvitesPage() {
  const [invites, setInvites] = useState<JobInviteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<InviteStatus | 'ALL'>('ALL');

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inviteApi.getMyInvites(page, 20);
      // Sort: PENDING first, then by date
      const sorted = (data.invites ?? []).sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setInvites(sorted);
      setTotalPages(data.totalPages);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  const handleDecline = async (id: number) => {
    await inviteApi.decline(id);
    fetchInvites();
  };

  const filtered = filter === 'ALL' ? invites : invites.filter(i => i.status === filter);
  const pendingCount = invites.filter(i => i.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Job invitations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} pending invitation${pendingCount > 1 ? 's' : ''}`
              : `${invites.length} total invitations`}
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const).map(s => {
            const count = s === 'ALL'
              ? invites.length
              : invites.filter(i => i.status === s).length;
            if (s !== 'ALL' && count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  filter === s
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {s === 'ALL' ? 'All' : STATUS_CONFIG[s].icon + ' ' + STATUS_CONFIG[s].label} ({count})
              </button>
            );
          })}
        </div>

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
            <p className="text-3xl mb-3">✉️</p>
            <p className="text-base font-medium text-gray-700 mb-1">No invitations yet</p>
            <p className="text-sm text-gray-500">
              Recruiters can invite you to apply for their openings
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(invite => (
              <InviteCard key={invite.id} invite={invite} onDecline={handleDecline} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}