'use client';

import { useState, useRef, useCallback } from 'react';
import type { JobseekerProfileDTO, JobseekerBasicInfoRequest } from '../types/profile';

interface BasicInfoFormProps {
  profile: JobseekerProfileDTO;
  onSave: (data: JobseekerBasicInfoRequest) => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function BasicInfoForm({ profile, onSave }: BasicInfoFormProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const triggerSave = useCallback(
    async (field: keyof JobseekerBasicInfoRequest, value: string | number | boolean) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      setSaveStatus('saving');
      try {
        await onSave({ [field]: value });
        setSaveStatus('saved');
        saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [onSave]
  );

  const fieldProps = (
    field: keyof JobseekerBasicInfoRequest,
    defaultValue: string = ''
  ) => ({
    defaultValue: (profile[field as keyof JobseekerProfileDTO] as string) ?? defaultValue,
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value.trim();
      const original = (profile[field as keyof JobseekerProfileDTO] as string) ?? '';
      if (val !== original) triggerSave(field, val);
    },
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
          Basic Information
        </h2>
        <div className="h-5">
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
              Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-teal-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-500">Failed to save</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Full Name
            </label>
            <input
              className="input text-sm"
              placeholder="Rahul Sharma"
              {...fieldProps('fullName')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Phone
            </label>
            <input
              className="input text-sm"
              placeholder="+91 98765 43210"
              {...fieldProps('phone')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Headline
          </label>
          <input
            className="input text-sm"
            placeholder="Backend Engineer · Java · Spring Boot"
            {...fieldProps('headline')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Summary
          </label>
          <textarea
            className="input text-sm resize-none"
            rows={3}
            placeholder="Brief intro about yourself, what you're working on, what you're looking for…"
            defaultValue={profile.summary ?? ''}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val !== (profile.summary ?? '')) triggerSave('summary', val);
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
              LinkedIn
            </label>
            <input
              className="input text-sm"
              placeholder="linkedin.com/in/username"
              {...fieldProps('linkedinUrl')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
              GitHub
            </label>
            <input
              className="input text-sm"
              placeholder="github.com/username"
              {...fieldProps('githubUrl')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Portfolio
            </label>
            <input
              className="input text-sm"
              placeholder="yoursite.com"
              {...fieldProps('portfolioUrl')}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Years of experience
            </label>
            <input
              type="number"
              min={0}
              max={40}
              step={0.5}
              className="input text-sm w-28"
              placeholder="2"
              defaultValue={profile.yearsOfExperience ?? ''}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val !== profile.yearsOfExperience) {
                  triggerSave('yearsOfExperience', val);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="careerBreak"
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              defaultChecked={profile.isOnCareerBreak ?? false}
              onChange={(e) => triggerSave('isOnCareerBreak', e.target.checked)}
            />
            <label
              htmlFor="careerBreak"
              className="text-sm text-gray-600 cursor-pointer"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Currently on a career break
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}