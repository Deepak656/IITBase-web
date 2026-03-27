'use client';

import type { EducationDTO } from '../types/profile';

interface EducationCardProps {
  edu: EducationDTO;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export default function EducationCard({ edu, onEdit, onDelete, deleting }: EducationCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 group">
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-gray-900"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {edu.institution}
        </p>
        <p className="text-sm text-gray-700 mt-0.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {edu.degree}
          {edu.fieldOfStudy && (
            <span className="text-gray-500"> · {edu.fieldOfStudy}</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {edu.startYear && `${edu.startYear} – `}
          {edu.endYear ?? 'Present'}
          {edu.grade && (
            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
              {edu.grade}
              {edu.gradeType === 'CGPA'
                ? ' CGPA'
                : edu.gradeType === 'PERCENTAGE'
                ? '%'
                : ''}
            </span>
          )}
        </p>
        {edu.description && (
          <p
            className="text-sm text-gray-600 mt-1.5 leading-relaxed"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {edu.description}
          </p>
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