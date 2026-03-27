'use client';

import { JobseekerProfileDTO, CompletionNudge } from '../types/profile';

interface Props {
  profile: JobseekerProfileDTO;
  onNudgeAction: (action: string) => void;
}

function getNextNudge(profile: JobseekerProfileDTO): CompletionNudge | null {
  if (!profile.fullName) return { label: 'Add your full name', points: 15, action: 'basic' };
  if (!profile.resumeUrl) return { label: 'Upload your resume', points: 20, action: 'resume' };
  if (!profile.headline) return { label: 'Add a headline', points: 10, action: 'basic' };
  if (!profile.profilePhotoUrl) return { label: 'Add a profile photo', points: 10, action: 'photo' };
  if (!profile.summary) return { label: 'Write a short summary', points: 10, action: 'basic' };
  if (!profile.workExperiences?.length) return { label: 'Add your work experience', points: 10, action: 'experience' };
  if (!profile.educations?.length) return { label: 'Add your education', points: 10, action: 'education' };
  if (!profile.skills?.length) return { label: 'Add your skills', points: 5, action: 'skills' };
  if (!profile.linkedinUrl) return { label: 'Add your LinkedIn URL', points: 5, action: 'basic' };
  if (!profile.phone) return { label: 'Add your phone number', points: 5, action: 'basic' };
  return null;
}

export default function ProfileCompletion({ profile, onNudgeAction }: Props) {
  const nudge = getNextNudge(profile);
  const completion = profile.profileCompletion ?? 0;

  if (completion >= 100 || !nudge) return null;

  return (
    <div className="bg-white rounded-lg border border-teal-200 border-l-4 border-l-teal-500 px-5 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
            {nudge.label}
          </p>
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Completes profile by +{nudge.points}%
          </p>
        </div>
      </div>
      <button
        onClick={() => onNudgeAction(nudge.action)}
        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-lg transition-all"
      >
        Do it now
      </button>
    </div>
  );
}