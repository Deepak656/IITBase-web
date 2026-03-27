'use client';

import type { CertificationDTO } from '../types/profile';
import { MONTH_NAMES } from '../types/profile';

interface CertificationCardProps {
  cert: CertificationDTO;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

function formatDate(month?: number, year?: number): string {
  if (!year) return '';
  return month ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`;
}

export default function CertificationCard({
  cert,
  onEdit,
  onDelete,
  deleting,
}: CertificationCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 group">
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-gray-900"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {cert.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{cert.issuer}</p>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
          {cert.issueYear && (
            <span>Issued {formatDate(cert.issueMonth, cert.issueYear)}</span>
          )}
          {!cert.doesNotExpire && cert.expiryYear && (
            <>
              <span>·</span>
              <span>Expires {formatDate(cert.expiryMonth, cert.expiryYear)}</span>
            </>
          )}
          {cert.doesNotExpire && (
            <span className="text-teal-600">· No expiry</span>
          )}
        </div>

        {cert.credentialId && (
          <p className="text-xs text-gray-400 mt-0.5">ID: {cert.credentialId}</p>
        )}
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-600 hover:underline mt-0.5 inline-block"
          >
            View credential ↗
          </a>
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