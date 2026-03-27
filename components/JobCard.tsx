import Link from 'next/link';
import type { Job } from '../types/job';

interface Props {
  job: Job;
}

export default function JobCard({ job }: Props) {
  // roleTitle is always set; fall back to jobDomain if somehow missing
  const roleDisplay = job.roleTitle ?? job.jobDomain?.replace(/_/g, ' ') ?? '';

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="app-job-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="app-job-card-title">{job.title}</h3>
            <p className="app-job-card-company">{job.company}</p>
            <div className="app-job-card-meta">
              <span className="app-job-card-meta-item">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="app-job-card-meta-item">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.minExperience}–{job.maxExperience} yrs
              </span>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0">
            <span className="app-tag app-tag-accent">{roleDisplay}</span>
          </div>
        </div>

        {job.techStack && job.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.techStack.slice(0, 6).map((tech, i) => (
              <span key={i} className="app-tag">{tech}</span>
            ))}
            {job.techStack.length > 6 && (
              <span style={{ fontSize: 12, color: 'var(--app-text-faint)', padding: '3px 6px' }}>
                +{job.techStack.length - 6} more
              </span>
            )}
          </div>
        )}

        <div className="app-job-card-footer">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
            <svg
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24"
              style={{ color: 'var(--app-accent)', marginTop: 2, flexShrink: 0 }}
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{
              fontSize: 13, color: 'var(--app-text-muted)',
              fontWeight: 300, lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              margin: 0,
            }}>
              {job.tierOneReason}
            </p>
          </div>
          <span className="app-job-card-date">
            {new Date(job.createdAt).toLocaleDateString('en-IN', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}