'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { profileApi } from '../../../lib/profileApi';
import type { JobseekerProfileDTO, BasicInfoRequest } from '../types/profile';

interface UseProfileReturn {
  profile: JobseekerProfileDTO | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saved: boolean;
  refetch: () => Promise<void>;
  updateBasicInfo: (data: BasicInfoRequest) => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
  uploading: { resume: boolean; photo: boolean };
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<JobseekerProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState({ resume: false, photo: false });
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getFullProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const updateBasicInfo = useCallback(async (data: BasicInfoRequest) => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await profileApi.updateBasicInfo(data);
      setProfile(updated);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadResume = useCallback(async (file: File) => {
    setUploading((prev) => ({ ...prev, resume: true }));
    try {
      await profileApi.uploadResume(file);
      await refetch();
    } finally {
      setUploading((prev) => ({ ...prev, resume: false }));
    }
  }, [refetch]);

  const uploadPhoto = useCallback(async (file: File) => {
    setUploading((prev) => ({ ...prev, photo: true }));
    try {
      await profileApi.uploadPhoto(file);
      await refetch();
    } finally {
      setUploading((prev) => ({ ...prev, photo: false }));
    }
  }, [refetch]);

  return {
    profile,
    loading,
    error,
    saving,
    saved,
    refetch,
    updateBasicInfo,
    uploadResume,
    uploadPhoto,
    uploading,
  };
}