'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, type StaffInviteResponse } from '../../../lib/adminApi';
import ProtectedRoute from '../../../components/ProtectedRoute';

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  PENDING:  { bg: 'var(--app-amber-bg)',  color: 'var(--app-amber)',  border: 'var(--app-amber-border)',  label: 'Pending' },
  ACCEPTED: { bg: 'var(--app-green-bg)',  color: 'var(--app-green)',  border: 'var(--app-green-border)',  label: 'Accepted' },
  EXPIRED:  { bg: 'var(--app-slate-bg)',  color: 'var(--app-slate)',  border: 'var(--app-slate-border)',  label: 'Expired' },
  REVOKED:  { bg: 'var(--app-red-bg)',    color: 'var(--app-red)',    border: 'var(--app-red-border)',    label: 'Revoked' },
};

function AdminStaffContent() {
  const [invites, setInvites]           = useState<StaffInviteResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [email, setEmail]               = useState('');
  const [sending, setSending]           = useState(false);
  const [sendError, setSendError]       = useState('');
  const [sendSuccess, setSendSuccess]   = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError]               = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.staff.listInvites();
      setInvites(res.content ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSendError('');
    setSendSuccess('');
    setSending(true);
    try {
      await adminApi.staff.sendInvite(email.trim());
      setSendSuccess(`Invite sent to ${email}`);
      setEmail('');
      await load();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (id: number, inviteEmail: string) => {
    if (!confirm(`Revoke invite for ${inviteEmail}?`)) return;
    setActionLoading(id);
    try {
      await adminApi.staff.revokeInvite(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = invites.filter(i => i.status === 'PENDING').length;

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="app-page-header">
        <h1 className="app-page-title">Staff access</h1>
        <p className="app-page-subtitle">
          Invite people to join IITBase as staff. They get full admin access once they accept.
        </p>
      </div>

      {error && (
        <div className="app-callout app-callout-error" style={{ marginBottom: 20 }}>
          <p className="app-callout-text">{error}</p>
        </div>
      )}

      {/* Send invite */}
      <div className="app-card" style={{ marginBottom: 24 }}>
        <h2 className="app-card-title" style={{ marginBottom: 6 }}>Invite a staff member</h2>
        <p style={{ fontSize: 13, color: 'var(--app-text-muted)', marginBottom: 18, fontWeight: 300 }}>
          They'll receive an invite link valid for 7 days. If they don't have an IITBase account, they'll create one on acceptance.
        </p>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label className="app-label">Email address</label>
            <input
              className="app-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ marginBottom: 0 }}
            />
          </div>
          <button
            className="app-btn app-btn-primary"
            onClick={handleSend}
            disabled={sending || !email.trim()}
            style={{ marginTop: 22 }}
          >
            {sending ? 'Sending…' : 'Send invite'}
          </button>
        </div>

        {sendSuccess && (
          <p style={{ fontSize: 13, color: 'var(--app-green)', marginTop: 10 }}>
            ✓ {sendSuccess}
          </p>
        )}
        {sendError && (
          <p style={{ fontSize: 13, color: 'var(--app-red)', marginTop: 10 }}>
            {sendError}
          </p>
        )}
      </div>

      {/* Invite list */}
      <div className="app-section">
        <div className="app-section-header">
          <span className="app-section-title">
            Invites
            {pendingCount > 0 && (
              <span style={{
                marginLeft: 8, padding: '1px 8px', borderRadius: 20,
                fontSize: 11, fontWeight: 600,
                background: 'var(--app-amber-bg)',
                border: '1px solid var(--app-amber-border)',
                color: 'var(--app-amber)',
              }}>
                {pendingCount} pending
              </span>
            )}
          </span>
          <button className="app-btn app-btn-ghost app-btn-sm" onClick={load}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '8px 0' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: '1px solid var(--app-border)' }}>
                <div style={{ flex: 1 }}>
                  <div className="app-skeleton" style={{ height: 14, width: '30%', marginBottom: 8 }} />
                  <div className="app-skeleton" style={{ height: 11, width: '20%' }} />
                </div>
                <div className="app-skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ) : invites.length === 0 ? (
          <div className="app-section-empty">
            No invites sent yet.
          </div>
        ) : (
          invites.map((invite, idx) => {
            const s = STATUS_STYLE[invite.status] ?? STATUS_STYLE.EXPIRED;
            return (
              <div key={invite.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 22px',
                borderBottom: idx < invites.length - 1 ? '1px solid var(--app-border)' : 'none',
              }}>
                {/* Avatar initial */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--app-bg-subtle)',
                  border: '1px solid var(--app-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: 'var(--app-text-faint)',
                }}>
                  {invite.email[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>
                      {invite.email}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                    }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
                    Invited by {invite.invitedByEmail}
                    {' · '}
                    {new Date(invite.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                    {invite.status === 'PENDING' && (
                      <> · expires {new Date(invite.expiresAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}</>
                    )}
                    {invite.status === 'ACCEPTED' && invite.acceptedAt && (
                      <> · accepted {new Date(invite.acceptedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}</>
                    )}
                  </div>
                </div>

                {/* Revoke */}
                {invite.status === 'PENDING' && (
                  <button
                    className="app-btn app-btn-danger app-btn-sm"
                    disabled={actionLoading === invite.id}
                    onClick={() => handleRevoke(invite.id, invite.email)}
                    style={{ flexShrink: 0 }}
                  >
                    {actionLoading === invite.id ? '…' : 'Revoke'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Help note */}
      <div className="app-callout app-callout-info" style={{ marginTop: 20 }}>
        <p className="app-callout-text">
          <strong>First admin?</strong> The very first staff account must be created directly in the database:
          sign up normally, then run <code style={{ fontFamily: 'monospace', fontSize: 12 }}>UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com'</code> in the Railway console.
          After that, use this page to invite everyone else.
        </p>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminStaffContent />
    </ProtectedRoute>
  );
}