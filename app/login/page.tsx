'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { setToken, setRole } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { refreshAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({ email, password });
      setToken(response.token);
      setRole(response.role);
      refreshAuth();
      const next = new URLSearchParams(window.location.search).get('next');

      if (response.role === 'ADMIN') {
        router.push(next || '/admin/jobs');
      } else if (response.role === 'JOB_SEEKER') {
        router.push(next || '/jobs');
      } else if (response.role === 'RECRUITER') {
        router.push(next || '/profile');
      } else {
        router.push(next || '/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-2xl">I</span>
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sign in to IITBase
          </h1>
          <p className="text-gray-600 text-base">
            Access your professional account
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg 
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-red-800 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-900 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-900 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link 
                href="/reset-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-lg 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              New to IITBase?{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-700 transition-colors">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}