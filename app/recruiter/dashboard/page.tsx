'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  recruiterApi,
  recruiterJobApi,
  teamApi,
  type RecruiterProfileResponse,
  type RecruiterJobResponse,
  type TeamMemberResponse,
} from '../../../lib/recruiterApi';

// ── Status config ─────────────────────────────────────────────────────────────
const JOB_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:  { label: 'Active',  cls: 'app-badge app-badge-approved' },
  CLOSED:  { label: 'Closed',  cls: 'app-badge app-badge-expired' },
  DRAFT:   { label: 'Draft',   cls: 'app-badge app-badge-pending' },
  REMOVED: { label: 'Removed', cls: 'app-badge app-badge-rejected' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat({
  value, label, accent, onClick,
}: {
  value: number | string;
  label: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="app-card app-card-hover"
      style={{
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        padding: '20px 22px',
      }}
    >
      {accent && (
        <div style={{
          width: 32, height: 3, borderRadius: 2,
          background: accent, marginBottom: 14,
        }} />
      )}
      <div style={{
        fontFamily: 'var(--app-font-display)',
        fontSize: 28, fontWeight: 500,
        color: 'var(--app-text-primary)',
        letterSpacing: '-0.5px', lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--app-text-muted)', fontWeight: 300 }}>
        {label}
      </div>
    </button>
  );
}

// ── Job row ───────────────────────────────────────────────────────────────────
function JobRow({ job, onViewApplicants }: {
  job: RecruiterJobResponse;
  onViewApplicants: (id: number) => void;
}) {
  const { label, cls } = JOB_STATUS_MAP[job.status] ?? { label: job.status, cls: 'app-badge' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 0', gap: 14,
      borderBottom: '1px solid var(--app-border)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 500,
          color: 'var(--app-text-primary)',
          marginBottom: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {job.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className={cls} style={{ fontSize: 11 }}>{label}</span>
          <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
            {job.applyType === 'INTERNAL' ? '⚡ Easy Apply' : '↗ External'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
            {job.location}
          </span>
          <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
      {job.applyType === 'INTERNAL' && job.status === 'ACTIVE' && (
        <button
          className="app-btn app-btn-secondary app-btn-sm"
          onClick={() => onViewApplicants(job.id)}
          style={{ flexShrink: 0 }}
        >
          Applicants
        </button>
      )}
    </div>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function NavItem({
  icon, label, sub, onClick, danger = false, badge,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  danger?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '10px 12px',
        borderRadius: 8, border: 'none',
        background: 'none', cursor: 'pointer',
        transition: 'background 0.15s',
        textAlign: 'left',
        fontFamily: 'var(--app-font-body)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'none';
      }}
    >
      <span style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: danger ? 'var(--app-red-bg)' : 'var(--app-bg-subtle)',
        border: `1px solid ${danger ? 'var(--app-red-border)' : 'var(--app-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? 'var(--app-red)' : 'var(--app-text-muted)',
        fontSize: 14,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: danger ? 'var(--app-red)' : 'var(--app-text-primary)',
          lineHeight: 1.3,
        }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--app-text-faint)', marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
      {badge !== undefined && badge > 0 && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 9,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.25)',
          color: '#d97706', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 5px', flexShrink: 0,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile]           = useState<RecruiterProfileResponse | null>(null);
  const [jobs, setJobs]                 = useState<RecruiterJobResponse[]>([]);
  const [teamMembers, setTeamMembers]   = useState<TeamMemberResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const activeJobs   = jobs.filter(j => j.status === 'ACTIVE').length;
  const easyApply    = jobs.filter(j => j.applyType === 'INTERNAL' && j.status === 'ACTIVE').length;
  const isAdmin      = profile?.isAdmin ?? false;
  const isVerified   = profile?.company.isVerified ?? false;

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, jobsRes] = await Promise.allSettled([
        recruiterApi.getMyProfile(),
        recruiterJobApi.getMyListings(0, 50),
      ]);

      if (profileRes.status === 'rejected') {
        setProfileMissing(true);
        return;
      }

      const profileData = profileRes.value;
      setProfile(profileData);

      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.jobs ?? []);
      }

      // Load team + join requests in parallel (non-blocking)
      const [membersRes, requestsRes] = await Promise.allSettled([
        teamApi.getMembers(),
        profileData.isAdmin ? teamApi.getJoinRequests() : Promise.resolve(null),
      ]);

      if (membersRes.status === 'fulfilled') setTeamMembers(membersRes.value);
      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        const pending = (requestsRes.value.content ?? []).filter(
          r => r.status === 'PENDING'
        ).length;
        setPendingRequests(pending);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (profileMissing) router.replace('/recruiter/onboarding');
  }, [profileMissing, router]);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-shell">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="app-card" style={{ height: 80 }}>
            <div className="app-skeleton" style={{ height: 18, width: '25%', marginBottom: 10 }} />
            <div className="app-skeleton" style={{ height: 13, width: '15%' }} />
          </div>
          <div className="app-grid-2" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="app-card" style={{ height: 90 }}>
                <div className="app-skeleton" style={{ height: 3, width: 32, marginBottom: 14 }} />
                <div className="app-skeleton" style={{ height: 24, width: '40%', marginBottom: 8 }} />
                <div className="app-skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">

      {/* ── Unverified company banner ─────────────────────────────────────── */}
      {!isVerified && (
        <div className="app-callout app-callout-warning" style={{ marginBottom: 24 }}>
          <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4m0 4h.01" />
          </svg>
          <p className="app-callout-text">
            <strong>Company verification pending.</strong> Your job listings are visible but show an unverified badge. Our team typically reviews within 24–48 hours.
          </p>
        </div>
      )}

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{
              fontFamily: 'var(--app-font-display)',
              fontSize: 24, fontWeight: 500,
              color: 'var(--app-text-primary)', letterSpacing: '-0.3px', margin: 0,
            }}>
              {profile?.company.name}
            </h1>
            {isVerified && (
              <span className="app-badge app-badge-approved" style={{ fontSize: 11 }}>
                ✓ Verified
              </span>
            )}
            {isAdmin && (
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: 'var(--app-accent)',
              }}>
                Admin
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--app-text-muted)', fontWeight: 300, margin: 0 }}>
            {profile?.name} · {profile?.designation}
          </p>
        </div>

        <button
          className="app-btn app-btn-primary"
          onClick={() => router.push('/recruiter/jobs/new')}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post a job
        </button>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        <Stat
          value={jobs.length}
          label="Total listings"
          accent="var(--app-accent)"
          onClick={() => router.push('/recruiter/jobs')}
        />
        <Stat
          value={activeJobs}
          label="Active now"
          accent="var(--app-green)"
          onClick={() => router.push('/recruiter/jobs')}
        />
        <Stat
          value={easyApply}
          label="Easy Apply"
          accent="#8b5cf6"
          onClick={() => router.push('/recruiter/jobs')}
        />
        <Stat
          value={teamMembers.length}
          label={`Team member${teamMembers.length !== 1 ? 's' : ''}`}
          accent="var(--app-amber)"
          onClick={() => router.push('/recruiter/team')}
        />
      </div>

      {/* ── Main two-column layout ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

        {/* Left — recent listings */}
        <div>
          <div className="app-section">
            <div className="app-section-header">
              <span className="app-section-title">Recent listings</span>
              <button
                className="app-btn app-btn-ghost app-btn-sm"
                onClick={() => router.push('/recruiter/jobs')}
              >
                View all →
              </button>
            </div>

            <div className="app-section-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {recentJobs.length === 0 ? (
                <div className="app-empty" style={{ padding: '40px 0' }}>
                  <div className="app-empty-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="app-empty-title">No jobs posted yet</p>
                  <p className="app-empty-sub">Post your first job to start receiving applications from IIT graduates.</p>
                  <button
                    className="app-btn app-btn-primary"
                    onClick={() => router.push('/recruiter/jobs/new')}
                  >
                    Post your first job
                  </button>
                </div>
              ) : (
                <div style={{ paddingBottom: 4 }}>
                  {recentJobs.map(job => (
                    <JobRow
                      key={job.id}
                      job={job}
                      onViewApplicants={id => router.push(`/recruiter/jobs/${id}/applicants`)}
                    />
                  ))}
                  {jobs.length > 6 && (
                    <div style={{ paddingTop: 16 }}>
                      <button
                        className="app-btn app-btn-secondary"
                        style={{ width: '100%' }}
                        onClick={() => router.push('/recruiter/jobs')}
                      >
                        View all {jobs.length} listings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Jobs */}
          <div className="app-section">
            <div className="app-section-header" style={{ padding: '14px 16px' }}>
              <span className="app-section-title">Manage</span>
            </div>
            <div style={{ padding: '6px 4px' }}>
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>}
                label="Post a job"
                sub="Add a new listing"
                onClick={() => router.push('/recruiter/jobs/new')}
              />
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                label="All listings"
                sub={`${jobs.length} total`}
                onClick={() => router.push('/recruiter/jobs')}
              />
            </div>
          </div>

          {/* Team */}
          <div className="app-section">
            <div className="app-section-header" style={{ padding: '14px 16px' }}>
              <span className="app-section-title">Team</span>
            </div>
            <div style={{ padding: '6px 4px' }}>
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                label="Team members"
                sub={`${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''}`}
                onClick={() => router.push('/recruiter/team')}
                badge={pendingRequests}
              />
              {isAdmin && (
                <NavItem
                  icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  label="Invite teammate"
                  sub="Send an invite link"
                  onClick={() => router.push('/recruiter/team')}
                />
              )}
            </div>
          </div>

          {/* Company + Account */}
          <div className="app-section">
            <div className="app-section-header" style={{ padding: '14px 16px' }}>
              <span className="app-section-title">Account</span>
            </div>
            <div style={{ padding: '6px 4px' }}>
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                label="My profile"
                sub="Name, designation"
                onClick={() => router.push('/recruiter/profile')}
              />
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                label="Company details"
                sub={profile?.company.name}
                onClick={() => router.push(`/companies/${profile?.company.id}`)}
              />
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                label="Change email"
                sub="Update login email"
                onClick={() => router.push('/change-email')}
              />
              <NavItem
                icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                label="Reset password"
                sub="Change your password"
                onClick={() => router.push('/reset-password')}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Company info footer card ───────────────────────────────────────── */}
      {profile && (
        <div className="app-card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Company logo placeholder */}
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: profile.company.logoUrl
                  ? `url(${profile.company.logoUrl}) center/cover`
                  : 'var(--app-bg-subtle)',
                border: '1px solid var(--app-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--app-font-display)',
                fontSize: 18, fontWeight: 500, color: 'var(--app-text-faint)',
              }}>
                {!profile.company.logoUrl && profile.company.name[0]}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)', marginBottom: 2 }}>
                  {profile.company.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--app-text-muted)', fontWeight: 300 }}>
                  {[profile.company.industry, profile.company.size].filter(Boolean).join(' · ')}
                  {profile.company.website && (
                    <> · <a href={profile.company.website} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--app-accent)', textDecoration: 'none' }}>
                      {profile.company.website.replace(/^https?:\/\//, '')}
                    </a></>
                  )}
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                className="app-btn app-btn-secondary app-btn-sm"
                onClick={() => router.push(`/companies/${profile.company.id}`)}
              >
                Edit company →
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}