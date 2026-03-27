'use client';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  ctaLabel: string;
  onCta: () => void;
}

export function EmptyState({ icon, message, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-3 text-gray-400">
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
        {message}
      </p>
      <button
        onClick={onCta}
        className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
      >
        {ctaLabel} →
      </button>
    </div>
  );
}

export function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
        </div>
      ))}
    </div>
  );
}