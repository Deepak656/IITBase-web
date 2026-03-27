'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  teamApi,
  recruiterApi,
  type TeamMemberResponse,
  type RecruiterInviteResponse,
  type JoinRequestResponse,
  type TeamMemberRole,
  type RecruiterProfileResponse,
} from '../../../lib/recruiterApi';

type Tab = 'members' | 'invites' | 'requests';

// ── Helpers ────────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: TeamMemberRole }) {
  return role === 'ADMIN' ? (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
      color: '#a5b4fc',
    }}>
      Admin
    </span>
  ) : (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
      color: '#64748b',
    }}>
      Member
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.3))',
      border: '1px solid rgba(99,102,241,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 600, color: '#a5b4fc',
      flexShrink: 0,
    }}>
      {initials || '?'}
    </div>
  );
}

export default function TeamPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('members');
  const [profile, setProfile] = useState<RecruiterProfileResponse | null>(null);
  const [members, setMembers] = useState<TeamMemberResponse[]>([]);
  const [invites, setInvites] = useState<RecruiterInviteResponse[]>([]);
  const [requests, setRequests] = useState<JoinRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');

  // Action loading states
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const isAdmin = profile?.isAdmin ?? false;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [profileData, membersData] = await Promise.all([
        recruiterApi.getMyProfile(),
        teamApi.getMembers(),
      ]);
      setProfile(profileData);
      setMembers(membersData);

      // Only admins can see invites and join requests
      if (profileData.isAdmin) {
        const [invitesData, requestsData] = await Promise.all([
          teamApi.getPendingInvites(),
          teamApi.getJoinRequests(),
        ]);
        setInvites(invitesData.content ?? []);
        setRequests(requestsData.content ?? []);
      }
    } catch {
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteError('');
    setInviteSuccess('');
    setInviting(true);
    try {
      await teamApi.invite({ email: inviteEmail.trim(), role: inviteRole });
      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      await fetchAll();
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (recruiterId: number, newRole: TeamMemberRole) => {
    setActionLoading(recruiterId);
    try {
      await teamApi.updateRole(recruiterId, newRole);
      await fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (recruiterId: number, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    setActionLoading(recruiterId);
    try {
      await teamApi.removeMember(recruiterId);
      await fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvite = async (inviteId: number, email: string) => {
    if (!confirm(`Revoke invite for ${email}?`)) return;
    setActionLoading(inviteId);
    try {
      await teamApi.revokeInvite(inviteId);
      await fetchAll();
    } catch {
      setError('Failed to revoke invite');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await teamApi.approveJoinRequest(requestId);
      await fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    const reason = prompt('Rejection reason (optional):') ?? '';
    setActionLoading(requestId);
    try {
      await teamApi.rejectJoinRequest(requestId, reason || undefined);
      await fetchAll();
    } catch {
      setError('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequestCount = requests.filter(r => r.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="app-shell">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="app-card" style={{ height: 72 }}>
              <div className="app-skeleton" style={{ height: 16, width: '30%', marginBottom: 8 }} />
              <div className="app-skeleton" style={{ height: 12, width: '20%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="app-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="app-page-title">Team</h1>
          <p className="app-page-subtitle">
            {profile?.company.name} · {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="app-btn app-btn-ghost app-btn-sm"
          onClick={() => router.push('/recruiter/dashboard')}
        >
          ← Dashboard
        </button>
      </div>

      {error && (
        <div className="app-callout app-callout-error" style={{ marginBottom: 20 }}>
          <p className="app-callout-text">{error}</p>
        </div>
      )}

      {/* Invite panel — admin only */}
      {isAdmin && (
        <div className="app-card" style={{ marginBottom: 24 }}>
          <div className="app-card-header" style={{ marginBottom: 16 }}>
            <h2 className="app-card-title">Invite a teammate</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="app-label">Email address</label>
              <input
                className="app-input"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ minWidth: 140 }}>
              <label className="app-label">Role</label>
              <select
                className="app-select"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as TeamMemberRole)}
                style={{ marginBottom: 0 }}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              className="app-btn app-btn-primary"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              style={{ marginBottom: 0 }}
            >
              {inviting ? 'Sending…' : 'Send invite'}
            </button>
          </div>
          {inviteSuccess && (
            <p style={{ fontSize: 13, color: 'var(--app-green)', marginTop: 10 }}>
              ✓ {inviteSuccess}
            </p>
          )}
          {inviteError && (
            <p style={{ fontSize: 13, color: 'var(--app-red)', marginTop: 10 }}>
              {inviteError}
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="app-tabs">
        <button
          className={`app-tab${tab === 'members' ? ' active' : ''}`}
          onClick={() => setTab('members')}
        >
          Members
          <span className="app-tab-count">{members.length}</span>
        </button>
        {isAdmin && (
          <button
            className={`app-tab${tab === 'invites' ? ' active' : ''}`}
            onClick={() => setTab('invites')}
          >
            Pending invites
            {invites.length > 0 && (
              <span className="app-tab-count">{invites.length}</span>
            )}
          </button>
        )}
        {isAdmin && (
          <button
            className={`app-tab${tab === 'requests' ? ' active' : ''}`}
            onClick={() => setTab('requests')}
          >
            Join requests
            {pendingRequestCount > 0 && (
              <span className="app-tab-count" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                {pendingRequestCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Members tab */}
      {tab === 'members' && (
        <div className="app-section">
          {members.length === 0 ? (
            <div className="app-section-empty">No team members yet.</div>
          ) : (
            members.map((member, idx) => {
              const isMe = member.userId === profile?.userId;
              return (
                <div key={member.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 24px',
                  borderBottom: idx < members.length - 1 ? '1px solid var(--app-border)' : 'none',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <Avatar name={member.name} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>
                          {member.name}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: 11, color: 'var(--app-text-faint)' }}>(you)</span>
                        )}
                        <RoleBadge role={member.role} />
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginTop: 1 }}>
                        {member.designation ?? '—'}
                      </p>
                    </div>
                  </div>

                  {isAdmin && !isMe && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        className="app-btn app-btn-secondary app-btn-sm"
                        disabled={actionLoading === member.id}
                        onClick={() => handleRoleChange(
                          member.id,
                          member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
                        )}
                      >
                        {actionLoading === member.id
                          ? '…'
                          : member.role === 'ADMIN' ? 'Demote' : 'Make admin'
                        }
                      </button>
                      <button
                        className="app-btn app-btn-danger app-btn-sm"
                        disabled={actionLoading === member.id}
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pending invites tab */}
      {tab === 'invites' && isAdmin && (
        <div className="app-section">
          {invites.length === 0 ? (
            <div className="app-section-empty">No pending invites.</div>
          ) : (
            invites.map((invite, idx) => (
              <div key={invite.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px',
                borderBottom: idx < invites.length - 1 ? '1px solid var(--app-border)' : 'none',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)', marginBottom: 2 }}>
                    {invite.email}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                    Invited as <strong style={{ fontWeight: 500 }}>{invite.intendedRole}</strong>
                    {' · '}expires {new Date(invite.expiresAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <button
                  className="app-btn app-btn-danger app-btn-sm"
                  disabled={actionLoading === invite.id}
                  onClick={() => handleRevokeInvite(invite.id, invite.email)}
                >
                  {actionLoading === invite.id ? '…' : 'Revoke'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Join requests tab */}
      {tab === 'requests' && isAdmin && (
        <div className="app-section">
          {requests.length === 0 ? (
            <div className="app-section-empty">No pending join requests.</div>
          ) : (
            requests.map((req, idx) => (
              <div key={req.id} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: idx < requests.length - 1 ? '1px solid var(--app-border)' : 'none',
                gap: 16, flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>
                      User #{req.userId}
                    </span>
                    <span className={`app-badge app-badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.workEmail && (
                    <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginBottom: 4 }}>
                      Work email: <strong style={{ color: 'var(--app-text-secondary)', fontWeight: 500 }}>{req.workEmail}</strong>
                    </p>
                  )}
                  {req.message && (
                    <p style={{
                      fontSize: 13, color: 'var(--app-text-muted)',
                      fontStyle: 'italic', lineHeight: 1.5,
                    }}>
                      "{req.message}"
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--app-text-faint)', marginTop: 6 }}>
                    Requested {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      className="app-btn app-btn-primary app-btn-sm"
                      disabled={actionLoading === req.id}
                      onClick={() => handleApproveRequest(req.id)}
                    >
                      {actionLoading === req.id ? '…' : 'Approve'}
                    </button>
                    <button
                      className="app-btn app-btn-danger app-btn-sm"
                      disabled={actionLoading === req.id}
                      onClick={() => handleRejectRequest(req.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}