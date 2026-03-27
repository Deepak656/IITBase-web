'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, loading, role } = useAuth();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getProfileRoute = () => {
    if (isAdmin) return '/admin/jobs';
    if (role === 'RECRUITER') return '/recruiter/dashboard';
    return '/profile';
  };

  return (
    <nav className="app-nav">
      <div className="app-nav-inner">

        {/* Left — logo + links */}
        <div className="app-nav-left">
          <Link href="/" className="app-nav-logo">
            <div className="app-nav-logo-mark">I</div>
            <span className="app-nav-logo-text">IITBase</span>
          </Link>

          <div className="app-nav-links">
            <Link
              href="/jobs"
              className={`app-nav-link${isActive('/jobs') ? ' active' : ''}`}
            >
              Browse Jobs
            </Link>

            {(isAdmin || role === 'JOB_SEEKER') && (
              <Link
                href={
                  isAuthenticated
                    ? '/share-opportunity'
                    : `/signup?intent=share-opportunity&next=${encodeURIComponent('/share-opportunity')}`
                }
                className={`app-nav-link${isActive('/share-opportunity') ? ' active' : ''}`}
              >
                Share Opportunity
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/jobs"
                className={`app-nav-link${isActive('/admin') ? ' active' : ''}`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right — auth actions */}
        <div className="app-nav-right">
          {loading ? (
            <div
              className="app-skeleton"
              style={{ width: 80, height: 32, borderRadius: 8 }}
            />
          ) : isAuthenticated ? (
            <>
              <Link
                href={getProfileRoute()}
                className={`app-btn app-btn-ghost app-btn-sm${
                  isActive('/profile') || isActive('/recruiter') || isActive('/admin')
                    ? ' active'
                    : ''
                }`}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="app-btn app-btn-ghost app-btn-sm"
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="app-btn app-btn-ghost app-btn-sm">
                Sign in
              </Link>
              <Link href="/signup" className="app-btn app-btn-primary app-btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}