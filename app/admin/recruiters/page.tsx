'use client';
 
import { useState, useEffect, useCallback } from 'react';
import { adminApi, type AdminRecruiterResponse } from '../../../lib/adminApi';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
  AdminSplitPage, DetailShell, DetailSection, DetailGrid,
  DetailField, DetailDivider, DetailLoading, PersonCard,
  type SplitColumn,
} from '../../../components/AdminSplitPage';
 
function RecruiterDetail({ id, onSuspend, onUnsuspend, onClose, actionLoading }: {
  id: number;
  onSuspend: (id: number) => void;
  onUnsuspend: (id: number) => void;
  onClose: () => void;
  actionLoading: number | null;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    setLoading(true);
    adminApi.detail.recruiter(id).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [id]);
 
  if (loading) return <DetailLoading />;
  if (!detail) return null;
 
  const busy = actionLoading === id;
 
  return (
    <DetailShell onClose={onClose}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--app-font-display)', fontSize: 20, fontWeight: 500, color: 'var(--app-text-primary)', margin: '0 0 4px' }}>
            {detail.name ?? detail.email}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--app-text-muted)', margin: 0 }}>
            {detail.designation} · {detail.role}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {detail.isSuspended ? (
            <button className="app-btn app-btn-primary app-btn-sm" onClick={() => onUnsuspend(id)} disabled={busy}>
              {busy ? '…' : 'Unsuspend'}
            </button>
          ) : (
            <button className="app-btn app-btn-danger app-btn-sm"
              onClick={() => { if (confirm(`Suspend ${detail.email}? All sessions will be invalidated.`)) onSuspend(id); }}
              disabled={busy}>
              {busy ? '…' : 'Suspend'}
            </button>
          )}
        </div>
      </div>
 
      <DetailDivider />
 
      <DetailSection title="Contact">
        <DetailGrid>
          <DetailField label="Login email" value={detail.email} />
          <DetailField label="Work email" value={detail.workEmail} />
          <DetailField label="Phone" value={detail.phone} />
          <DetailField label="Joined" value={detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
        </DetailGrid>
      </DetailSection>
 
      <DetailDivider />
 
      {detail.company && (
        <>
          <DetailSection title="Company">
            <div style={{
              background: 'var(--app-bg-white)', border: '1px solid var(--app-border)',
              borderRadius: 10, padding: '14px 16px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>{detail.company.name}</span>
                <span className={`app-badge ${detail.company.isVerified ? 'app-badge-approved' : 'app-badge-pending'}`} style={{ fontSize: 11 }}>
                  {detail.company.status}
                </span>
              </div>
              <DetailGrid>
                <DetailField label="Website" value={detail.company.website} href={detail.company.website} />
                <DetailField label="Email domain" value={detail.company.emailDomain} mono />
                <DetailField label="Industry" value={detail.company.industry} />
                <DetailField label="Size" value={detail.company.size} />
              </DetailGrid>
            </div>
          </DetailSection>
          <DetailDivider />
        </>
      )}
 
      {detail.jobs?.length > 0 && (
        <DetailSection title={`Job listings (${detail.jobs.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {detail.jobs.map((j: any) => (
              <div key={j.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px',
                background: 'var(--app-bg-white)', border: '1px solid var(--app-border)', borderRadius: 8,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0 }}>{j.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--app-text-faint)', margin: '2px 0 0' }}>
                    {j.roleTitle} · {j.applyType === 'INTERNAL' ? '⚡ Easy Apply' : '↗ External'}
                  </p>
                </div>
                <span className={`app-badge app-badge-${j.status.toLowerCase()}`} style={{ fontSize: 11 }}>{j.status}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}
    </DetailShell>
  );
}
 
const RECRUITER_COLUMNS: SplitColumn<AdminRecruiterResponse>[] = [
  {
    key: 'name',
    label: 'Recruiter',
    render: row => (
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.userEmail}
        </p>
        <p style={{ fontSize: 11, color: 'var(--app-text-faint)', margin: '1px 0 0' }}>{row.designation ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'company',
    label: 'Company',
    render: row => (
      <div>
        <p style={{ fontSize: 12, color: 'var(--app-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.companyName}
        </p>
        <p style={{ fontSize: 11, color: 'var(--app-text-faint)', margin: '1px 0 0' }}>
          {row.companyVerified ? '✓ Verified' : 'Unverified'}
        </p>
      </div>
    ),
  },
  {
    key: 'role',
    label: 'Role',
    width: 72,
    render: row => (
      <span style={{
        fontSize: 11, padding: '2px 7px', borderRadius: 20,
        background: row.isAdmin ? 'var(--app-accent-dim)' : 'var(--app-bg-subtle)',
        border: `1px solid ${row.isAdmin ? 'var(--app-accent-border)' : 'var(--app-border)'}`,
        color: row.isAdmin ? 'var(--app-accent)' : 'var(--app-text-faint)',
      }}>
        {row.isAdmin ? 'Admin' : 'Member'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    width: 80,
    render: row => row.isSuspended ? (
      <span className="app-badge app-badge-rejected" style={{ fontSize: 11 }}>Suspended</span>
    ) : (
      <span style={{ fontSize: 11, color: 'var(--app-text-faint)' }}>Active</span>
    ),
  },
];
 
function AdminRecruitersContent() {
  const [rows, setRows]             = useState<AdminRecruiterResponse[]>([]);
  const [loading, setLoading]       = useState(true);
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
      const res = await adminApi.recruiters.getAll(page, 30);
      const filtered = search
        ? res.content.filter((r: any) =>
            r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
            r.companyName.toLowerCase().includes(search.toLowerCase()))
        : res.content;
      setRows(filtered);
      setTotalPages(res.totalPages);
      setTotal(res.totalElements);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, [page, search]);
 
  useEffect(() => { load(); }, [load]);
 
  const act = async (id: number, fn: () => Promise<any>) => {
    setAction(id);
    try { await fn(); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setAction(null); }
  };
 
  return (
    <AdminSplitPage
      title="Recruiters"
      totalElements={totalElements}
      rows={rows}
      columns={RECRUITER_COLUMNS}
      selectedId={selectedId}
      onSelect={id => setSelectedId(prev => prev === id ? null : id)}
      loading={loading}
      totalPages={totalPages}
      page={page}
      onPageChange={setPage}
      filterBar={
        <div className="app-search-wrap" style={{ width: '100%' }}>
          <svg className="app-search-icon" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input className="app-search-input" placeholder="Search by email or company…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      }
      detail={selectedId ? (
        <RecruiterDetail
          id={selectedId}
          onSuspend={id => act(id, () => adminApi.recruiters.suspend(id))}
          onUnsuspend={id => act(id, () => adminApi.recruiters.unsuspend(id))}
          onClose={() => setSelectedId(null)}
          actionLoading={actionLoading}
        />
      ) : null}
    />
  );
}
 
export default function AdminRecruitersPage() {
  return <ProtectedRoute adminOnly><AdminRecruitersContent /></ProtectedRoute>;
}