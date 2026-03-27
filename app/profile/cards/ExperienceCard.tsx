'use client';

import type { WorkExperienceDTO } from '../types/profile';
import { formatDateRange } from '../types/profile';

interface ExperienceCardProps {
  exp: WorkExperienceDTO;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export default function ExperienceCard({ exp, onEdit, onDelete, deleting }: ExperienceCardProps) {
  const dateRange = formatDateRange(
    exp.startMonth,
    exp.startYear,
    exp.endMonth,
    exp.endYear,
    exp.isCurrent,
  );
  const skills = exp.skillsUsed
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

  return (
    <div className="flex items-start justify-between gap-4 group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Company initial avatar */}
        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <span
            className="text-sm font-semibold text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {exp.company[0]?.toUpperCase() ?? '?'}
          </span>
        </div>

        <div className="min-w-0">
          <p
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {exp.title}
          </p>
          <p className="text-sm text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {exp.company}
            {exp.location && (
              <span className="text-gray-500"> · {exp.location}</span>
            )}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-xs text-gray-500"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {dateRange}
            </span>
            {exp.employmentType && (
              <>
                <span className="text-gray-300">·</span>
                <span
                  className="text-xs text-gray-500"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {exp.employmentType.replace('_', ' ')}
                </span>
              </>
            )}
            {exp.isCurrent && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-teal-50 text-teal-700 text-xs rounded">
                Current
              </span>
            )}
          </div>

          {exp.description && (
            <p
              className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {exp.description}
            </p>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.slice(0, 6).map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200"
                >
                  {s}
                </span>
              ))}
              {skills.length > 6 && (
                <span className="px-2 py-0.5 text-gray-400 text-xs">
                  +{skills.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
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
            <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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