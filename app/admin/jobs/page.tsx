'use client';

// ═══════════════════════════════════════════════════════════════════════════
// app/admin/jobs/page.tsx  — split panel job moderation
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../lib/adminApi';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
  AdminSplitPage, DetailShell, DetailSection, DetailGrid,
  DetailField, DetailDivider, DetailLoading, PersonCard,
  type SplitColumn,
} from '../../../components/AdminSplitPage';
import type { Job } from '../../../types/job';

// ── Community job detail panel ─────────────────────────────────────────────
function CommunityJobDetail({ id, onApprove, onReject, onExpire, onClose, actionLoading }: {
  id: number;
  onApprove: (id: number) => void;
  onReject:  (id: number) => void;
  onExpire:  (id: number) => void;
  onClose: () => void;
  actionLoading: number | null;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.detail.communityJob(id).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading />;
  if (!detail) return null;

  const busy = actionLoading === id;
  const techStack = detail.techStack ?? [];
  const skills    = detail.skills    ?? [];

  return (
    <DetailShell onClose={onClose}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0 }}>
            {detail.title}
          </h2>
          <span className="app-tag app-tag-accent" style={{ fontSize: 11 }}>{detail.jobDomain}</span>
          {detail.roleTitle && <span className="app-tag" style={{ fontSize: 11 }}>{detail.roleTitle}</span>}
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-secondary)', margin: '0 0 4px' }}>{detail.company}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {detail.location && <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>📍 {detail.location}</span>}
          <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{detail.minExperience}–{detail.maxExperience} yrs</span>
          <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
            {new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className="app-btn app-btn-primary app-btn-sm" onClick={() => onApprove(id)} disabled={busy} style={{ minWidth: 80 }}>
          {busy ? '…' : '✓ Approve'}
        </button>
        <button className="app-btn app-btn-danger app-btn-sm"
          onClick={() => { if (confirm('Reject this job?')) onReject(id); }} disabled={busy}>
          Reject
        </button>
        <button className="app-btn app-btn-secondary app-btn-sm" onClick={() => onExpire(id)} disabled={busy}>
          Mark expired
        </button>
        {detail.applyUrl && (
          <a href={detail.applyUrl} target="_blank" rel="noopener noreferrer"
            className="app-btn app-btn-ghost app-btn-sm" style={{ textDecoration: 'none' }}>
            View listing ↗
          </a>
        )}
      </div>

      <DetailDivider />

      {/* Tier-1 reason — primary decision signal */}
      {detail.tierOneReason && (
        <>
          <DetailSection title="Tier-1 justification">
            <div style={{
              background: 'var(--app-blue-bg)', border: '1px solid var(--app-blue-border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <p style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                {detail.tierOneReason}
              </p>
            </div>
          </DetailSection>
          <DetailDivider />
        </>
      )}

      {/* Job description */}
      {detail.jobDescription && (
        <>
          <DetailSection title="Job description">
            <p style={{ fontSize: 13, color: 'var(--app-text-secondary)', lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
              {detail.jobDescription}
            </p>
          </DetailSection>
          <DetailDivider />
        </>
      )}

      {/* Tech + skills */}
      {(techStack.length > 0 || skills.length > 0) && (
        <>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            {techStack.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Tech stack</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {techStack.map((t: string, i: number) => <span key={i} className="app-tag" style={{ fontSize: 12 }}>{t}</span>)}
                </div>
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skills.map((s: string, i: number) => <span key={i} className="app-tag" style={{ fontSize: 12 }}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
          <DetailDivider />
        </>
      )}

      {/* Poster context — critical for moderation */}
      {detail.poster && (
        <DetailSection title="Posted by">
          <PersonCard
            label={detail.poster.role === 'ADMIN' ? 'IITBase staff' : 'Job seeker'}
            email={detail.poster.email}
            name={detail.poster.fullName}
            phone={detail.poster.phone}
            designation={detail.poster.headline}
          />
          {detail.poster.role === 'JOB_SEEKER' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {detail.poster.linkedinUrl && (
                <a href={detail.poster.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="app-btn app-btn-ghost app-btn-sm" style={{ textDecoration: 'none', fontSize: 12 }}>
                  LinkedIn ↗
                </a>
              )}
              {detail.poster.isVerified !== undefined && (
                <span className={`app-badge ${detail.poster.isVerified ? 'app-badge-approved' : 'app-badge-pending'}`} style={{ fontSize: 11 }}>
                  Profile {detail.poster.isVerified ? 'verified' : 'unverified'}
                </span>
              )}
              {detail.poster.profileCompletion !== undefined && (
                <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
                  {detail.poster.profileCompletion}% complete
                </span>
              )}
            </div>
          )}
        </DetailSection>
      )}
    </DetailShell>
  );
}

// ── Recruiter job detail panel ─────────────────────────────────────────────
function RecruiterJobDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.detail.recruiterJob(id).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading />;
  if (!detail) return null;

  const techStack = detail.techStack ?? [];
  const skills    = detail.skills    ?? [];

  return (
    <DetailShell onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0 }}>
            {detail.title}
          </h2>
          <span className="app-tag app-tag-accent" style={{ fontSize: 11 }}>{detail.jobDomain}</span>
          <span className={`app-badge app-badge-${detail.status.toLowerCase()}`} style={{ fontSize: 11 }}>{detail.status}</span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-secondary)', margin: '0 0 4px' }}>{detail.company?.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {detail.location && <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>📍 {detail.location}</span>}
          <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{detail.minExperience}–{detail.maxExperience} yrs</span>
          <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
            {detail.applyType === 'INTERNAL' ? '⚡ Easy Apply' : '↗ External'}
          </span>
        </div>
      </div>

      {detail.applyUrl && (
        <a href={detail.applyUrl} target="_blank" rel="noopener noreferrer"
          className="app-btn app-btn-ghost app-btn-sm" style={{ textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
          View listing ↗
        </a>
      )}

      <DetailDivider />

      {/* Recruiter — who posted it */}
      {detail.recruiter && (
        <>
          <DetailSection title="Posted by">
            <PersonCard
              label="Recruiter"
              email={detail.recruiter.email}
              name={detail.recruiter.name}
              phone={detail.recruiter.phone}
              workEmail={detail.recruiter.workEmail}
              designation={detail.recruiter.designation}
              role={detail.recruiter.role}
            />
          </DetailSection>
          <DetailDivider />
        </>
      )}

      {/* Company */}
      {detail.company && (
        <>
          <DetailSection title="Company">
            <div style={{ background: 'var(--app-bg-white)', border: '1px solid var(--app-border)', borderRadius: 10, padding: '14px 16px' }}>
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

      {/* JD */}
      {detail.jobDescription && (
        <>
          <DetailSection title="Job description">
            <p style={{ fontSize: 13, color: 'var(--app-text-secondary)', lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
              {detail.jobDescription}
            </p>
          </DetailSection>
          <DetailDivider />
        </>
      )}

      {/* Salary */}
      {(detail.salaryMin || detail.salaryMax) && (
        <DetailSection title="Compensation">
          <p style={{ fontSize: 14, color: 'var(--app-text-primary)', margin: 0 }}>
            {detail.currency} {detail.salaryMin?.toLocaleString('en-IN')}
            {detail.salaryMax ? ` – ${detail.salaryMax?.toLocaleString('en-IN')}` : '+'}
          </p>
        </DetailSection>
      )}

      {(techStack.length > 0 || skills.length > 0) && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {techStack.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Tech stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {techStack.map((t: string, i: number) => <span key={i} className="app-tag" style={{ fontSize: 12 }}>{t}</span>)}
              </div>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.map((s: string, i: number) => <span key={i} className="app-tag" style={{ fontSize: 12 }}>{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </DetailShell>
  );
}

// ── Table columns ──────────────────────────────────────────────────────────
const JOB_COLUMNS: SplitColumn<Job>[] = [
  {
    key: 'title',
    label: 'Job',
    render: row => (
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.title}
        </p>
        <p style={{ fontSize: 11, color: 'var(--app-text-faint)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.company}
        </p>
      </div>
    ),
  },
  {
    key: 'domain',
    label: 'Domain',
    width: 110,
    render: row => (
      <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{row.jobDomain}</span>
    ),
  },
  {
    key: 'exp',
    label: 'Exp',
    width: 60,
    render: row => (
      <span style={{ fontSize: 11, color: 'var(--app-text-faint)' }}>{row.minExperience}–{row.maxExperience}y</span>
    ),
  },
  {
    key: 'date',
    label: 'Submitted',
    width: 78,
    render: row => (
      <span style={{ fontSize: 11, color: 'var(--app-text-faint)' }}>
        {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>
    ),
  },
];

// ── Main page ──────────────────────────────────────────────────────────────
function AdminJobsContent() {
  const [tab, setTab]               = useState<'pending' | 'reported'>('pending');
  const [pendingJobs, setPending]   = useState<Job[]>([]);
  const [reportedJobs, setReported] = useState<Job[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setAction]  = useState<number | null>(null);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([adminApi.jobs.getPending(), adminApi.jobs.getReported()]);
      setPending(p);
      setReported(r);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: number, fn: () => Promise<void>) => {
    setAction(id);
    try { await fn(); setSelectedId(null); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setAction(null); }
  };

  const rows = tab === 'pending' ? pendingJobs : reportedJobs;

  return (
    <AdminSplitPage
      title="Job moderation"
      totalElements={pendingJobs.length + reportedJobs.length}
      rows={rows}
      columns={JOB_COLUMNS}
      selectedId={selectedId}
      onSelect={id => setSelectedId(prev => prev === id ? null : id)}
      loading={loading}
      totalPages={1}
      page={0}
      onPageChange={() => {}}
      emptyText="All clear — no jobs pending review."
      filterBar={
        <div className="app-tabs" style={{ marginBottom: 0 }}>
          <button className={`app-tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>
            Pending review
            {pendingJobs.length > 0 && <span className="app-tab-count">{pendingJobs.length}</span>}
          </button>
          <button className={`app-tab${tab === 'reported' ? ' active' : ''}`} onClick={() => setTab('reported')}>
            Reported
            {reportedJobs.length > 0 && <span className="app-tab-count" style={{ background: 'var(--app-amber-bg)', color: 'var(--app-amber)' }}>{reportedJobs.length}</span>}
          </button>
        </div>
      }
      detail={selectedId ? (
        <CommunityJobDetail
          id={selectedId}
          onApprove={id => act(id, () => adminApi.jobs.approve(id))}
          onReject={id => act(id, () => adminApi.jobs.reject(id))}
          onExpire={id => act(id, () => adminApi.jobs.markExpired(id))}
          onClose={() => setSelectedId(null)}
          actionLoading={actionLoading}
        />
      ) : null}
    />
  );
}

export default function AdminJobsPage() {
  return <ProtectedRoute adminOnly><AdminJobsContent /></ProtectedRoute>;
}