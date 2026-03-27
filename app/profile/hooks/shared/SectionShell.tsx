'use client';

import { ReactNode } from 'react';

interface Props {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function SectionShell({
  title,
  onAdd,
  addLabel = '+ Add',
  children,
  isEmpty = false,
  emptyTitle,
  emptyMessage,
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {addLabel}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {isEmpty ? (
          <EmptyState title={emptyTitle} message={emptyMessage} onAdd={onAdd} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  message,
  onAdd,
}: {
  title?: string;
  message?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      {title && (
        <p className="text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </p>
      )}
      {message && (
        <p className="text-xs text-gray-500 mb-4 max-w-xs" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {message}
        </p>
      )}
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
        >
          Add now
        </button>
      )}
    </div>
  );
}