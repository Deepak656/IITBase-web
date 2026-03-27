'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationApi, type NotificationItem } from '../../lib/recruiterApi';
import { useAuth } from '../../context/AuthContext';

// ── NotificationItem UI ───────────────────────────────────────────────────────
function NotifItem({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: number, payload: Record<string, unknown>) => void;
}) {
  const iconMap: Record<string, string> = {
    PROFILE_VIEWED: '👁️',
    RESUME_DOWNLOADED: '📄',
    APPLICATION_SHORTLISTED: '⭐',
    APPLICATION_INTERVIEW: '📅',
    APPLICATION_OFFER: '🎁',
    APPLICATION_HIRED: '🎉',
    APPLICATION_REJECTED: '📩',
    JOB_INVITE: '✉️',
    NEW_APPLICATION: '👤',
  };

  const icon = iconMap[item.type] ?? '🔔';
  const relTime = getRelativeTime(item.createdAt);

  return (
    <button
      onClick={() => onRead(item.id, item.payload)}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
        !item.isRead ? 'bg-teal-50/40' : ''
      }`}
    >
      <div className="flex gap-3 items-start">
        <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 leading-snug">
              {item.title}
            </p>
            {!item.isRead && (
              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
            {item.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">{relTime}</p>
        </div>
      </div>
    </button>
  );
}

// ── Main Bell Component ───────────────────────────────────────────────────────
export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch unread count ────────────────────────────────────────────────────
  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationApi.getUnreadCount();
      setUnread(data.unreadCount);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  // ── Fetch notification list ───────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getAll(0, 20);
      setNotifications(data.notifications ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // ── SSE connection ────────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    if (sseRef.current) sseRef.current.close();

    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) return;

    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    const es = new EventSource(
      `${base}/api/v1/notifications/stream?token=${token}`
    );

    es.addEventListener('notification', (e) => {
      try {
        const notif: NotificationItem = JSON.parse(e.data);
        setUnread(prev => prev + 1);
        setNotifications(prev => [notif, ...prev]);
      } catch { /* ignore parse error */ }
    });

    es.onerror = () => {
      es.close();
      sseRef.current = null;
      // Fallback: polling every 30s
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchCount, 30_000);
      }
    };

    sseRef.current = es;
  }, [isAuthenticated, fetchCount]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCount();
    connectSSE();
    return () => {
      sseRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, fetchCount, connectSSE]);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Fetch list when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRead = async (id: number, payload: Record<string, unknown>) => {
    try {
      await notificationApi.markOneRead(id);
      setUnread(prev => Math.max(0, prev - 1));
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setOpen(false);
      navigateFromPayload(payload);
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
    finally { setMarkingAll(false); }
  };

  const navigateFromPayload = (payload: Record<string, unknown>) => {
    if (payload.applicationId) router.push(`/applications?id=${payload.applicationId}`);
    else if (payload.inviteId) router.push('/invites');
    else if (payload.jobId) router.push(`/jobs/${payload.jobId}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markingAll}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
              >
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-4 py-3 border-b border-gray-100 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem key={n.id} item={n} onRead={handleRead} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                onClick={() => { router.push('/notifications'); setOpen(false); }}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium w-full text-center"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}