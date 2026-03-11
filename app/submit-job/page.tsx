'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { PRIMARY_ROLES } from '../../lib/constants';
import ProtectedRoute from '../../components/ProtectedRoute';

function SubmitJobForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    applyUrl: '',
    sourceUrl: '',
    jobDescription: '',
    minExperience: '',
    maxExperience: '',
    primaryRole: 'SOFTWARE_ENGINEER',
    techStack: '',
    skills: '',
    tierOneReason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parseInt(formData.minExperience) > parseInt(formData.maxExperience)) {
      setError('Minimum experience cannot be greater than maximum experience');
      return;
    }

    setLoading(true);

    try {
      await api.jobs.submit({
        ...formData,
        minExperience: parseInt(formData.minExperience),
        maxExperience: parseInt(formData.maxExperience),
        techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      
      alert('Job submitted successfully! Our team will review it shortly.');
      router.push('/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to submit job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Job</h1>
          <p className="text-gray-600">
            Help us build the best platform for tier-1 graduates. All submissions are manually reviewed.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-600">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior Backend Engineer"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TechCorp"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-600">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Remote, Bangalore"
                />
              </div>
            </div>

            <div>
              <label htmlFor="applyUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Application URL <span className="text-red-600">*</span>
              </label>
              <input
                id="applyUrl"
                type="url"
                value={formData.applyUrl}
                onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://company.com/careers/job-id"
              />
              <p className="text-xs text-gray-500 mt-1">Direct link where candidates can apply</p>
            </div>

            <div>
              <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Source URL <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/jobs/view/..."
              />
              <p className="text-xs text-gray-500 mt-1">Where you found this listing (LinkedIn, company website, etc.)</p>
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                placeholder="Brief description of the role, responsibilities, and requirements..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="minExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Min Experience (years) <span className="text-red-600">*</span>
                </label>
                <input
                  id="minExperience"
                  type="number"
                  value={formData.minExperience}
                  onChange={(e) => setFormData({ ...formData, minExperience: e.target.value })}
                  required
                  min="0"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="maxExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Experience (years) <span className="text-red-600">*</span>
                </label>
                <input
                  id="maxExperience"
                  type="number"
                  value={formData.maxExperience}
                  onChange={(e) => setFormData({ ...formData, maxExperience: e.target.value })}
                  required
                  min="0"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="primaryRole" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Role <span className="text-red-600">*</span>
              </label>
              <select
                id="primaryRole"
                value={formData.primaryRole}
                onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {PRIMARY_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="techStack"
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Java, Spring Boot, PostgreSQL, AWS"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of technologies</p>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="System Design, REST APIs, Microservices"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of key skills</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <label htmlFor="tierOneReason" className="block text-sm font-medium text-blue-900 mb-2">
                Why is this a Tier-1 opportunity? <span className="text-red-600">*</span>
              </label>
              <textarea
                id="tierOneReason"
                value={formData.tierOneReason}
                onChange={(e) => setFormData({ ...formData, tierOneReason: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-3 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., JD explicitly mentions IIT preference, or requires strong system design skills typically found in tier-1 graduates"
              />
              <p className="text-xs text-blue-700 mt-2">
                Explain why this role is specifically suited for graduates from top-tier institutions
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your submission will be reviewed by our team within 24-48 hours
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SubmitJobPage() {
  return (
    <ProtectedRoute>
      <SubmitJobForm />
    </ProtectedRoute>
  );
}