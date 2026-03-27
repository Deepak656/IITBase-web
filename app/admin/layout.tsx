'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  {
    label: 'Overview',
    href: '/admin',
    exact: true,
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Job moderation',
    href: '/admin/jobs',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Jobseekers',
    href: '/admin/jobseekers',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Companies',
    href: '/admin/companies',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Recruiters',
    href: '/admin/recruiters',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: 'Staff access',
    href: '/admin/staff',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--app-bg)',
      fontFamily: 'var(--app-font-body)',
    }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 56 : 220,
        flexShrink: 0,
        background: 'var(--app-bg-white)',
        borderRight: '1px solid var(--app-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>

        {/* Logo + collapse */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '16px 0' : '16px 16px',
          borderBottom: '1px solid var(--app-border)',
          height: 56,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <Link href="/admin" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              textDecoration: 'none',
            }}>
              <div style={{
                width: 28, height: 28,
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                borderRadius: 7, display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--app-font-display)',
                fontSize: 14, fontWeight: 600, color: 'white',
                flexShrink: 0,
              }}>
                I
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-primary)', lineHeight: 1.2 }}>
                  IITBase
                </div>
                <div style={{ fontSize: 10, color: 'var(--app-text-faint)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Staff
                </div>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(p => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--app-text-faint)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {collapsed
                ? <path d="M9 18l6-6-6-6" />
                : <path d="M15 18l-6-6 6-6" />
              }
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 6px', overflow: 'hidden' }}>
          {NAV.map(item => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '8px 0' : '7px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 7,
                  textDecoration: 'none',
                  marginBottom: 2,
                  background: active ? 'var(--app-accent-dim)' : 'none',
                  color: active ? 'var(--app-accent)' : 'var(--app-text-muted)',
                  fontWeight: active ? 500 : 400,
                  fontSize: 13,
                  transition: 'background 0.15s, color 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-hover)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'none';
                }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — back to site + logout */}
        <div style={{
          padding: '8px 6px 12px',
          borderTop: '1px solid var(--app-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          <Link
            href="/jobs"
            title={collapsed ? 'Back to site' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '8px 0' : '7px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 7, textDecoration: 'none',
              color: 'var(--app-text-faint)', fontSize: 13,
              transition: 'background 0.15s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {!collapsed && 'Back to site'}
          </Link>

          <button
            onClick={logout}
            title={collapsed ? 'Sign out' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '8px 0' : '7px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 7, background: 'none', border: 'none',
              color: 'var(--app-text-faint)', fontSize: 13,
              cursor: 'pointer', width: '100%',
              transition: 'background 0.15s',
              fontFamily: 'var(--app-font-body)',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}