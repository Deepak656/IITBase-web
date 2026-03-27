'use client';
 
import { useState } from 'react';
import { applicationApi } from '../../lib/recruiterApi';
 
interface Props {
  jobId: number;
  jobTitle: string;
  companyName: string;
  resumeFileName?: string;
  onSuccess: () => void;
  onClose: () => void;
}
 
export function ApplyModal({
  jobId, jobTitle, companyName, resumeFileName, onSuccess, onClose,
}: Props) {
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await applicationApi.apply({
        recruiterJobId: jobId,
        coverNote: coverNote.trim() || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application';
      if (msg.includes('409') || msg.toLowerCase().includes('already applied')) {
        setError('You have already applied to this job.');
      } else if (msg.toLowerCase().includes('resume')) {
        setError('Please upload your resume to your profile before applying.');
      } else {
        setError(msg);
      }
    } finally { setSubmitting(false); }
  };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Apply for this role</h2>
            <p className="text-sm text-gray-500 mt-0.5">{jobTitle} · {companyName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
 
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
              {error.includes('resume') && (
                <a href="/profile" className="text-sm text-red-700 underline mt-1 block">
                  Go to profile →
                </a>
              )}
            </div>
          )}
 
          {/* Resume preview */}
          <div className="px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-xs text-teal-700 font-medium mb-0.5">Resume to be submitted</p>
            <p className="text-sm text-teal-800 font-medium">
              📄 {resumeFileName ?? 'Resume from your profile'}
            </p>
            <a href="/profile" className="text-xs text-teal-600 hover:underline mt-0.5 block">
              Update resume →
            </a>
          </div>
 
          {/* Cover note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              placeholder="Tell the recruiter why you're a great fit…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{coverNote.length}/1000</p>
          </div>
 
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold rounded-lg transition-colors">
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}