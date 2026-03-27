// ═══════════════════════════════════════════════════════════════════════════
// app/admin/companies/page.tsx
// ═══════════════════════════════════════════════════════════════════════════
'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, type AdminCompanyResponse } from '../../../lib/adminApi';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
  AdminSplitPage, DetailShell, DetailSection, DetailGrid,
  DetailField, DetailDivider, DetailLoading, PersonCard,
  type SplitColumn,
} from '../../../components/AdminSplitPage';

// ── Detail panel ───────────────────────────────────────────────────────────
function CompanyDetail({
  id,
  onVerify,
  onUnverify,
  onClose,
  actionLoading,
}: {
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
    adminApi.detail.company(id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading />;
  if (!detail) return null;

  const busy = actionLoading === id;

  return (
    <DetailShell onClose={onClose}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <h2 style={{
              fontFamily: 'var(--app-font-display)',
              fontSize: 20, fontWeight: 500,
              color: 'var(--app-text-primary)', margin: 0,
            }}>
              {detail.name}
            </h2>
            <span className={`app-badge ${detail.isVerified ? 'app-badge-approved' : 'app-badge-pending'}`}>
              {detail.status}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--app-text-muted)', margin: 0 }}>
            {detail.industry} · {detail.size}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!detail.isVerified ? (
            <button className="app-btn app-btn-primary app-btn-sm" onClick={() => onVerify(id)} disabled={busy}>
              {busy ? '…' : '✓ Verify'}
            </button>
          ) : (
            <button className="app-btn app-btn-secondary app-btn-sm" onClick={() => onUnverify(id)} disabled={busy}>
              {busy ? '…' : 'Unverify'}
            </button>
          )}
          {detail.website && (
            <a href={detail.website} target="_blank" rel="noopener noreferrer"
              className="app-btn app-btn-ghost app-btn-sm" style={{ textDecoration: 'none' }}>
              Website ↗
            </a>
          )}
        </div>
      </div>

      <DetailDivider />

      <DetailSection title="Company details">
        <DetailGrid>
          <DetailField label="Website" value={detail.website} href={detail.website} />
          <DetailField label="Email domain" value={detail.emailDomain} mono />
          <DetailField label="Industry" value={detail.industry} />
          <DetailField label="Size" value={detail.size} />
          <DetailField label="Added" value={detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
        </DetailGrid>
        {detail.description && (
          <p style={{ fontSize: 13, color: 'var(--app-text-secondary)', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
            {detail.description}
          </p>
        )}
      </DetailSection>

      {detail.createdBy && (
        <>
          <DetailDivider />
          <DetailSection title="Created by">
            <PersonCard
              label="Founder / first admin"
              email={detail.createdBy.email}
              name={detail.createdBy.name}
              phone={detail.createdBy.phone}
              workEmail={detail.createdBy.workEmail}
              designation={detail.createdBy.designation}
            />
          </DetailSection>
        </>
      )}

      {detail.recruiters?.length > 0 && (
        <>
          <DetailDivider />
          <DetailSection title={`Team (${detail.recruiters.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {detail.recruiters.map((r: any) => (
                <div key={r.id} style={{
                  background: 'var(--app-bg-white)',
                  border: '1px solid var(--app-border)',
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text-primary)' }}>{r.name ?? '—'}</span>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: 'var(--app-accent-dim)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)' }}>{r.role}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '4px 12px' }}>
                    {r.email && <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{r.email}</span>}
                    {r.workEmail && <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>Work: {r.workEmail}</span>}
                    {r.phone && <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>📞 {r.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </>
      )}
    </DetailShell>
  );
}

// ── Table columns ──────────────────────────────────────────────────────────
const COMPANY_COLUMNS: SplitColumn<AdminCompanyResponse>[] = [
  {
    key: 'name',
    label: 'Company',
    render: row => (
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--app-text-faint)', margin: '1px 0 0' }}>{row.industry}</p>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    width: 90,
    render: row => (
      <span className={`app-badge ${row.isVerified ? 'app-badge-approved' : 'app-badge-pending'}`} style={{ fontSize: 11 }}>
        {row.isVerified ? 'Verified' : 'Pending'}
      </span>
    ),
  },
  {
    key: 'recruiters',
    label: 'Recr.',
    width: 52,
    render: row => (
      <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{row.recruiterCount}</span>
    ),
  },
  {
    key: 'added',
    label: 'Added',
    width: 88,
    render: row => (
      <span style={{ fontSize: 11, color: 'var(--app-text-faint)' }}>
        {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>
    ),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────
function AdminCompaniesContent() {
  const [rows, setRows]             = useState<AdminCompanyResponse[]>([]);
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
      const res = await adminApi.companies.getAll(page, 30, search || undefined, verified);
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
      title="Companies"
      totalElements={totalElements}
      rows={rows}
      columns={COMPANY_COLUMNS}
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
            <input className="app-search-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {(['unverified','verified','all'] as const).map(f => (
            <button key={f} className={`app-filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'unverified' ? 'Pending' : f === 'verified' ? 'Verified' : 'All'}
            </button>
          ))}
        </div>
      }
      detail={selectedId ? (
        <CompanyDetail
          id={selectedId}
          onVerify={id => act(id, () => adminApi.companies.verify(id))}
          onUnverify={id => act(id, () => adminApi.companies.unverify(id))}
          onClose={() => setSelectedId(null)}
          actionLoading={actionLoading}
        />
      ) : null}
    />
  );
}

export default function AdminCompaniesPage() {
  return <ProtectedRoute adminOnly><AdminCompaniesContent /></ProtectedRoute>;
}