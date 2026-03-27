'use client';

import { useCallback, useRef } from 'react';
import { useProfile } from './hooks/useProfile';
import ProfileHeader from './components/ProfileHeader';
import ProfileCompletion from './components/ProfileCompletion';
import BasicInfoForm from './components/BasicInfoForm';
import ExperienceSection from './components/sections/ExperienceSection';
import EducationSection from './components/sections/EducationSection';
import SkillsSection from './components/sections/SkillsSection';
import ProjectsSection from './components/sections/ProjectsSection';
import CertificationsSection from './components/sections/CertificationsSection';
import JobPreferencesSection from './components/sections/JobPreferencesSection';
import SectionSkeleton from './hooks/shared/SectionSkeleton';

export default function ProfilePage() {
  const {
    profile,
    loading,
    error,
    refetch,
    updateBasicInfo,
    uploadResume,
    uploadPhoto,
    uploading,
    saving,
    saved,
  } = useProfile();

  // Scroll targets for nudge actions
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const handleNudgeAction = useCallback((action: string) => {
    const map: Record<string, React.RefObject<HTMLDivElement>> = {
      basic: basicInfoRef,
      experience: experienceRef,
      education: educationRef,
      skills: skillsRef,
      resume: resumeRef,
      photo: photoRef,
    };
    map[action]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">

        {/* Profile header */}
        {loading || !profile ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ) : (
          <div ref={photoRef}>
            <ProfileHeader
              profile={profile}
              saving={saving}
              saved={saved}
              onPhotoUpload={uploadPhoto}
              onEditBasicInfo={() =>
                basicInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            />
          </div>
        )}

        {/* Completion nudge */}
        {profile && (
          <ProfileCompletion profile={profile} onNudgeAction={handleNudgeAction} />
        )}

        {/* Basic info form */}
        <div ref={basicInfoRef}>
          {loading || !profile ? (
            <SectionSkeleton rows={2} />
          ) : (
            <BasicInfoForm profile={profile} onSave={updateBasicInfo} />
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* Left col — main sections */}
          <div className="col-span-2 space-y-4">
            <div ref={experienceRef}>
              <ExperienceSection
                experiences={profile?.workExperiences ?? []}
                loading={loading}
                onRefetch={refetch}
              />
            </div>

            <div ref={educationRef}>
              <EducationSection
                educations={profile?.educations ?? []}
                loading={loading}
                onRefetch={refetch}
              />
            </div>

            <div ref={skillsRef}>
              <SkillsSection
                skills={profile?.skills ?? []}
                loading={loading}
                onRefresh={refetch}
              />
            </div>

            <ProjectsSection
              projects={profile?.projects ?? []}
              loading={loading}
              onRefetch={refetch}
            />

            <CertificationsSection
              certifications={profile?.certifications ?? []}
              loading={loading}
              onRefetch={refetch}
            />
          </div>

          {/* Right col — preferences + resume (sticky) */}
          <div className="col-span-1 sticky top-6" ref={resumeRef}>
            <JobPreferencesSection
              preference={profile?.jobPreference ?? null}
              loading={loading}
              resumeUrl={profile?.resumeUrl}
              resumeFileName={profile?.resumeFileName}
              resumeUploading={uploading.resume}
              onResumeUpload={uploadResume}
              onPreferenceSaved={refetch}
            />
          </div>
        </div>

      </div>
    </div>
  );
}