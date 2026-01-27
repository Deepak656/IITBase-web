'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import ReportJobModal from '../../../components/ReportJobModal';
import RemovalRequestModal from '../../../components/RemovalRequestModal';
import type { Job } from '../../../types/job';
import { useAuth } from '../../../context/AuthContext';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authed } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [params.id]);

  const loadJob = async () => {
    try {
      const data = await api.jobs.getById(Number(params.id));
      setJob(data);
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     APPLY HANDLER (CORE LOGIC) & Guard against multiple rapid clicks (minor UX polish)
     ================================ */
    
    const handleApply = () => {
    if (!job?.applyUrl || applying) return;
    setApplying(true);


    if (!authed) {
      router.push(
        `/signup?intent=apply&next=${encodeURIComponent(
          `/jobs/${job.id}?apply=1`
        )}`
      );
      return;
    }

    window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
  };
  /* =========================================
     AUTO-OPEN APPLY URL AFTER LOGIN/SIGNUP
     ========================================= */
  useEffect(() => {
      if (!job) return;

      const shouldApply = searchParams.get('apply');

      if (authed && shouldApply === '1' && job.applyUrl) {
        window.open(job.applyUrl, '_blank', 'noopener,noreferrer');

        // Clean URL so refresh doesn't re-trigger
        router.replace(`/jobs/${job.id}`);
      }
    }, [authed, job, searchParams, router]);
  /* ================================
     LOADING STATE
     ================================ */
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  /* ================================
     NOT FOUND
     ================================ */
  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-600 mb-6">This opportunity may have been removed or expired</p>
            <button
              onClick={() => router.push('/jobs')}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }
  /* ================================
     MAIN VIEW
     ================================ */
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </button>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-lg text-gray-700 mb-4">
              <span className="font-medium">{job.company}</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.minExperience}-{job.maxExperience} years
              </span>
            </div>
            <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              Apply for this Position
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About this Role</h2>
              {job.jobDescription ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.jobDescription}</p>
              ) : (
                <p className="text-gray-600 italic">No description provided. View the original listing for more details.</p>
              )}
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Why This is Tier-1 Focused</h3>
                  <p className="text-blue-800 leading-relaxed">{job.tierOneReason}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Primary Role</p>
                  <p className="text-gray-900 font-medium">{job.primaryRole.replace(/_/g, ' ')}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Experience Required</p>
                  <p className="text-gray-900 font-medium">{job.minExperience} - {job.maxExperience} years</p>
                </div>

                {job.techStack && job.techStack.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {job.techStack.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Posted</p>
                  <p className="text-gray-900">
                    {new Date(job.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Report an Issue
                </button>
                <button
                  onClick={() => setShowRemovalModal(true)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Request Removal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportJobModal
          jobId={job.id}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showRemovalModal && (
        <RemovalRequestModal
          jobId={job.id}
          onClose={() => setShowRemovalModal(false)}
        />
      )}
    </div>
  );
}