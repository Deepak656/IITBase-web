'use client';

import type { ProjectDTO } from '../types/profile';
import { MONTH_NAMES } from '../types/profile';

interface ProjectCardProps {
  project: ProjectDTO;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

function formatPeriod(p: ProjectDTO): string {
  if (!p.startYear) return p.isOngoing ? 'Ongoing' : '';
  const start = `${p.startMonth ? MONTH_NAMES[p.startMonth - 1] + ' ' : ''}${p.startYear}`;
  const end = p.isOngoing
    ? 'Present'
    : p.endYear
    ? `${p.endMonth ? MONTH_NAMES[p.endMonth - 1] + ' ' : ''}${p.endYear}`
    : '';
  return end ? `${start} – ${end}` : start;
}

export default function ProjectCard({ project, onEdit, onDelete, deleting }: ProjectCardProps) {
  const period = formatPeriod(project);
  const techList = project.techStack
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

  return (
    <div className="flex items-start justify-between gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {project.title}
          </span>
          {project.isOngoing && (
            <span className="px-2 py-0.5 text-xs bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Active
            </span>
          )}
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-600 hover:underline flex items-center gap-0.5"
            >
              Live
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-0.5"
            >
              GitHub
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>

        {period && <p className="text-xs text-gray-500 mt-0.5">{period}</p>}

        {project.description && (
          <p
            className="text-sm text-gray-600 mt-1.5 leading-relaxed"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {project.description}
          </p>
        )}

        {techList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {techList.map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete"
        >
          {deleting ? (
            <div className="w-3.5 h-3.5 border border-red-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}