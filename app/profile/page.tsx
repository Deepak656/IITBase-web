'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { getRole } from '../../lib/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProfileSettings from '../../components/ProfileSettings';
import MySubmissions from '../../components/MySubmissions';

function ProfileContent() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ 
    email: string; 
    role: string;
    college?: string; 
    graduationYear?: number;
    activeSessions?: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'submitted' | 'profile'>('submitted');

  useEffect(() => {
    const userRole = getRole();
    setRole(userRole);
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const data = await api.user.me();
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-20">
              {/* User Avatar */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {userInfo?.email ? userInfo.email.charAt(0).toUpperCase() : (role === 'RECRUITER' ? 'R' : role === 'ADMIN' ? 'A' : 'J')}
                  </span>
                </div>
                <h3 className="text-center font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {role === 'RECRUITER' ? 'Recruiter' : role === 'ADMIN' ? 'Administrator' : 'Job Seeker'}
                </h3>
                <p className="text-center text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {userInfo?.email || 'Loading...'}
                </p>
                {userInfo?.college && (
                  <p className="text-center text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {userInfo.college}
                    {userInfo.graduationYear && ` '${userInfo.graduationYear.toString().slice(-2)}`}
                  </p>
                )}
                <p className="text-center text-xs text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1 mb-6">
                <button
                  onClick={() => setActiveTab('submitted')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'submitted'
                      ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    My Submissions
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile Settings
                  </div>
                </button>
              </nav>

              {/* Submit Job Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push('/submit-job')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-400 to-cyan-300 text-gray-900 font-medium rounded-lg hover:from-teal-500 hover:to-cyan-400 transition-all text-sm shadow-sm"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit New Job
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'submitted' ? (
              <MySubmissions />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Profile Settings
                  </h2>
                  <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Manage your account information and security
                  </p>
                </div>

                <div className="p-6">
                  <ProfileSettings 
                    userInfo={userInfo} 
                    onUpdate={loadUserInfo}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}