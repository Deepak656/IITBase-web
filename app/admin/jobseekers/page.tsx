'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, type AdminJobseekerResponse } from '../../../lib/adminApi';
import {
  AdminSplitPage, DetailShell, DetailSection, DetailGrid,
  DetailField, DetailDivider, DetailLoading, PersonCard,
  type SplitColumn,
} from '../../../components/AdminSplitPage';
import ProtectedRoute from '../../../components/ProtectedRoute';

function JobseekerDetail({ id, onVerify, onUnverify, onClose, actionLoading }: {
  id: number;
  onVerify: (id: number) => void;
  onUnverify: (id: number) => void;
  onClose: () => void;
  actionLoading: number | null;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.detail.jobseeker(id).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading />;
  if (!detail) return null;

  const busy = actionLoading === id;
  const canVerify = detail.fullName && detail.profileCompletion >= 40;

  return (
    <DetailShell onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {detail.profilePhotoUrl ? (
            <img src={detail.profilePhotoUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--app-bg-subtle)', border: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: 'var(--app-text-faint)' }}>
              {(detail.fullName || detail.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 500, color: 'var(--app-text-primary)', margin: '0 0 3px' }}>
              {detail.fullName ?? <span style={{ fontStyle: 'italic', color: 'var(--app-text-faint)' }}>No name yet</span>}
            </h2>
            {detail.headline && <p style={{ fontSize: 13, color: 'var(--app-text-muted)', margin: 0 }}>{detail.headline}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {detail.resumeUrl && (
            <a href={detail.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="app-btn app-btn-ghost app-btn-sm" style={{ textDecoration: 'none' }}>
              Resume ↗
            </a>
          )}
          {!detail.isVerified ? (
            <div title={!canVerify ? 'Needs name + ≥40% completion' : undefined}>
              <button className="app-btn app-btn-primary app-btn-sm" onClick={() => onVerify(id)}
                disabled={busy || !canVerify} style={{ opacity: !canVerify ? 0.4 : 1 }}>
                {busy ? '…' : '✓ Verify'}
              </button>
            </div>
          ) : (
            <button className="app-btn app-btn-secondary app-btn-sm"
              onClick={() => { if (confirm('Unverify this profile?')) onUnverify(id); }} disabled={busy}>
              {busy ? '…' : 'Unverify'}
            </button>
          )}
        </div>
      </div>

      {/* Completion bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--app-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${detail.profileCompletion}%`, height: '100%', borderRadius: 3,
            background: detail.profileCompletion >= 80 ? 'var(--app-green)'
                      : detail.profileCompletion >= 50 ? 'var(--app-amber)'
                      : 'var(--app-red)',
          }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--app-text-faint)', minWidth: 36, textAlign: 'right' }}>
          {detail.profileCompletion}%
        </span>
        <span className={`app-badge ${detail.isVerified ? 'app-badge-approved' : 'app-badge-pending'}`} style={{ fontSize: 11 }}>
          {detail.isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>

      <DetailDivider />

      <DetailSection title="Contact">
        <DetailGrid>
          <DetailField label="Email" value={detail.email} />
          <DetailField label="Phone" value={detail.phone} />
          <DetailField label="LinkedIn" value={detail.linkedinUrl} href={detail.linkedinUrl} />
          <DetailField label="GitHub" value={detail.githubUrl} href={detail.githubUrl} />
          <DetailField label="Portfolio" value={detail.portfolioUrl} href={detail.portfolioUrl} />
          <DetailField label="Experience" value={detail.yearsOfExperience ? `${detail.yearsOfExperience} yrs` : null} />
        </DetailGrid>
      </DetailSection>

      {detail.summary && (
        <>
          <DetailDivider />
          <DetailSection title="Summary">
            <p style={{ fontSize: 13, color: 'var(--app-text-secondary)', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
              {detail.summary}
            </p>
          </DetailSection>
        </>
      )}
    </DetailShell>
  );
}

const JOBSEEKER_COLUMNS: SplitColumn<AdminJobseekerResponse>[] = [
  {
    key: 'name',
    label: 'Name',
    render: row => (
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.fullName ?? <span style={{ fontStyle: 'italic', color: 'var(--app-text-faint)' }}>No name</span>}
        </p>
        <p style={{ fontSize: 11, color: 'var(--app-text-faint)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</p>
      </div>
    ),
  },
  {
    key: 'completion',
    label: 'Completion',
    width: 100,
    render: row => (
      <div>
        <div style={{ height: 4, background: 'var(--app-bg-subtle)', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
          <div style={{ width: `${row.profileCompletion}%`, height: '100%', borderRadius: 2, background: row.profileCompletion >= 80 ? 'var(--app-green)' : row.profileCompletion >= 50 ? 'var(--app-amber)' : 'var(--app-red)' }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--app-text-faint)' }}>{row.profileCompletion}%</span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    width: 76,
    render: row => (
      <span className={`app-badge ${row.isVerified ? 'app-badge-approved' : 'app-badge-pending'}`} style={{ fontSize: 11 }}>
        {row.isVerified ? 'Verified' : 'Pending'}
      </span>
    ),
  },
];

function AdminJobseekersContent() {
  const [rows, setRows]             = useState<AdminJobseekerResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<'all'|'unverified'|'verified'>('unverified');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotal]   = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setAction]  = useState<number | null>(null);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const verified = filter === 'all' ? undefined : filter === 'verified';
      const res = await adminApi.jobseekers.getAll(page, 30, search || undefined, verified);
      setRows(res.content);
      setTotalPages(res.totalPages);
      setTotal(res.totalElements);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [filter, search]);

  const act = async (id: number, fn: () => Promise<any>) => {
    setAction(id);
    try { await fn(); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setAction(null); }
  };

  return (
    <AdminSplitPage
      title="Jobseekers"
      totalElements={totalElements}
      rows={rows}
      columns={JOBSEEKER_COLUMNS}
      selectedId={selectedId}
      onSelect={id => setSelectedId(prev => prev === id ? null : id)}
      loading={loading}
      totalPages={totalPages}
      page={page}
      onPageChange={setPage}
      filterBar={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="app-search-wrap" style={{ flex: 1, minWidth: 160 }}>
            <svg className="app-search-icon" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="app-search-input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {(['unverified','verified','all'] as const).map(f => (
            <button key={f} className={`app-filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'unverified' ? 'Pending' : f === 'verified' ? 'Verified' : 'All'}
            </button>
          ))}
        </div>
      }
      detail={selectedId ? (
        <JobseekerDetail
          id={selectedId}
          onVerify={id => act(id, () => adminApi.jobseekers.verify(id))}
          onUnverify={id => act(id, () => adminApi.jobseekers.unverify(id))}
          onClose={() => setSelectedId(null)}
          actionLoading={actionLoading}
        />
      ) : null}
    />
  );
}

export function AdminJobseekersPage() {
  return <ProtectedRoute adminOnly><AdminJobseekersContent /></ProtectedRoute>;
}
export default AdminJobseekersPage;