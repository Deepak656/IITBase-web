'use client';

import SectionSkeleton from '../../hooks/shared/SectionSkeleton';
import JobPreferencesForm from '../../forms/JobPreferencesForm';
import ResumeUpload from '../../upload/ResumeUpload';
import type { JobPreferenceDTO } from '../../types/profile';

interface Props {
  preference: JobPreferenceDTO | null;
  loading?: boolean;
  // Resume props — right column hosts both panels
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploading: boolean;
  onResumeUpload: (file: File) => Promise<void>;
  onPreferenceSaved: () => Promise<void>;
}

export default function JobPreferencesSection({
  preference,
  loading,
  resumeUrl,
  resumeFileName,
  resumeUploading,
  onResumeUpload,
  onPreferenceSaved,
}: Props) {
  if (loading) return <SectionSkeleton rows={3} />;

  return (
    <div className="space-y-4">
      {/* Job preferences card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <JobPreferencesForm preference={preference} onSaved={onPreferenceSaved} />
      </div>

      {/* Resume upload card */}
      <ResumeUpload
        resumeUrl={resumeUrl}
        resumeFileName={resumeFileName}
        onUpload={onResumeUpload}
        uploading={resumeUploading}
      />
    </div>
  );
}