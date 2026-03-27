'use client';

interface SectionSkeletonProps {
  rows?: number;
}

export default function SectionSkeleton({ rows = 2 }: SectionSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="h-4 bg-gray-100 rounded w-32" />
        <div className="h-7 bg-gray-100 rounded w-20" />
      </div>

      {/* Rows */}
      <div className="px-6 py-5 space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Avatar placeholder */}
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}