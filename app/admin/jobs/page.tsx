'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import type { Job } from '../../../types/job';

function AdminJobsContent() {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [reportedJobs, setReportedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'reported'>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const [pending, reported] = await Promise.all([
        api.admin.getPending(),
        api.admin.getReported(),
      ]);
      setPendingJobs(pending);
      setReportedJobs(reported);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await api.admin.approve(id);
      await loadJobs();
    } catch (error) {
      alert('Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this job?')) return;
    
    setActionLoading(id);
    try {
      await api.admin.reject(id);
      await loadJobs();
    } catch (error) {
      alert('Failed to reject job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkExpired = async (id: number) => {
    setActionLoading(id);
    try {
      await api.admin.markExpired(id);
      await loadJobs();
    } catch (error) {
      alert('Failed to mark job as expired');
    } finally {
      setActionLoading(null);
    }
  };

  const jobs = activeTab === 'pending' ? pendingJobs : reportedJobs;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Review and moderate job submissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Review
                {pendingJobs.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {pendingJobs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reported')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reported'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reported Jobs
                {reportedJobs.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    {reportedJobs.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} jobs</h3>
                <p className="text-gray-600">All caught up! Check back later for new submissions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-base font-medium text-gray-700 mb-2">{job.company}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span>•</span>
                          <span>{job.minExperience}-{job.maxExperience} years</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {job.primaryRole.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {job.jobDescription && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                        <p className="text-gray-700 leading-relaxed">{job.jobDescription}</p>
                      </div>
                    )}

                    {job.techStack && job.techStack.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {job.techStack.map((tech, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Tier-1 Justification</p>
                      <p className="text-blue-800 leading-relaxed">{job.tierOneReason}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-300">
                      <button
                        onClick={() => handleApprove(job.id)}
                        disabled={actionLoading === job.id}
                        className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === job.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(job.id)}
                        disabled={actionLoading === job.id}
                        className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleMarkExpired(job.id)}
                        disabled={actionLoading === job.id}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Expired
                      </button>
                      <div className="flex-1"></div>
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                      >
                        View Listing
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Submitted on {new Date(job.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminJobsContent />
    </ProtectedRoute>
  );
}