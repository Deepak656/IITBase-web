import Link from 'next/link';
import type { Job } from '../types/job';

interface Props {
  job: Job;
}

export default function JobCard({ job }: Props) {
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-teal-600 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              {job.title}
            </h3>
            <p className="text-base font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {job.company}
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.minExperience}-{job.maxExperience} years
              </span>
            </div>
          </div>
          <div className="ml-4">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200">
              {job.primaryRole.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {job.techStack && job.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.techStack.slice(0, 6).map((tech, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {tech}
              </span>
            ))}
            {job.techStack.length > 6 && (
              <span className="px-2.5 py-1 text-gray-500 text-xs font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                +{job.techStack.length - 6} more
              </span>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600 line-clamp-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {job.tierOneReason}
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </Link>
  );
}