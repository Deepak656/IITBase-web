'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import type { Job, MyJobsResponse, MyJobsStatsResponse } from '../types/job';

export default function MySubmissions() {
  const router = useRouter();
  const [myJobsData, setMyJobsData] = useState<MyJobsResponse | null>(null);
  const [stats, setStats] = useState<MyJobsStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Load stats once on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load jobs whenever filter or page changes
  useEffect(() => {
    loadMyJobs();
  }, [statusFilter, currentPage]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await api.jobs.mySubmissionsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const statuses = statusFilter === 'ALL' ? undefined : [statusFilter];
      const data = await api.jobs.mySubmissions({
        statuses,
        page: currentPage,
        size: pageSize,
      });
      setMyJobsData(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setMyJobsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const badges = {
      PENDING: { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800', label: 'Pending Review' },
      APPROVED: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800', label: 'Approved' },
      REJECTED: { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-800', label: 'Rejected' },
      UNDER_REVIEW: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800', label: 'Under Review' },
      EXPIRED: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-800', label: 'Expired' },
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    return (
      <span className={`px-2.5 py-1 ${badge.bg} ${badge.text} text-xs font-medium rounded-full border ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const filteredJobs = myJobsData?.jobs || [];
  const totalPages = myJobsData?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Total Submissions
            </p>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          {statsLoading ? (
            <div className="h-9 bg-gray-200 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats?.total || 0}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Approved
            </p>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          {statsLoading ? (
            <div className="h-9 bg-gray-200 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats?.approved || 0}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Pending
            </p>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {statsLoading ? (
            <div className="h-9 bg-gray-200 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats?.pending || 0}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Rejected
            </p>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          {statsLoading ? (
            <div className="h-9 bg-gray-200 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stats?.rejected || 0}
            </p>
          )}
        </div>
      </div>

      {/* Job Submissions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                My Job Submissions
              </h2>
              <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Track the status of jobs you've submitted to IITBase
              </p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-300 text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {statusFilter === 'ALL' ? 'No submissions yet' : `No ${statusFilter.toLowerCase().replace('_', ' ')} jobs`}
              </h3>
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {statusFilter === 'ALL' 
                  ? 'Start by submitting your first job opportunity'
                  : `You don't have any ${statusFilter.toLowerCase().replace('_', ' ')} submissions`
                }
              </p>
              {statusFilter === 'ALL' && (
                <button
                  onClick={() => router.push('/submit-job')}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-300 text-gray-900 font-medium rounded-lg hover:from-teal-500 hover:to-cyan-400 transition-all shadow-sm"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Submit a Job
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-5 border border-gray-200 rounded-lg hover:border-teal-300 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(job.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <span>{job.minExperience}-{job.maxExperience} years</span>
                      <span className="text-gray-400">•</span>
                      <span>{job.primaryRole.replace(/_/g, ' ')}</span>
                      <span className="text-gray-400">•</span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>

                    {job.techStack && job.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.techStack.slice(0, 5).map((tech, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        View Details
                      </button>
                      {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        View Listing
                      </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}