'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, loading } = useAuth();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout(); // redirect handled in AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                IITBase
              </span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-1">

              <Link
                href="/jobs"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/jobs')
                    ? 'bg-slate-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Browse Jobs
              </Link>

              <Link
                href={
                  isAuthenticated
                    ? '/submit-job'
                    : `/signup?intent=submit-job&next=${encodeURIComponent(
                        '/submit-job'
                      )}`
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/submit-job')
                    ? 'bg-slate-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Submit Job
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/jobs"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin')
                      ? 'bg-slate-50 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">

            {/* Prevent hydration flicker */}
            {loading ? (
              <div className="w-24 h-8 bg-gray-100 rounded animate-pulse"></div>
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    isActive('/profile')
                      ? 'bg-slate-50 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
