'use client';

import { useState, useEffect, useCallback } from 'react';
import { preferencesApi } from '../../../lib/profileApi';
import type { JobPreferenceDTO } from '../types/profile';

interface UseJobPreferencesReturn {
  preference: JobPreferenceDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  save: (data: JobPreferenceDTO) => Promise<void>;
  submitting: boolean;
}

export function useJobPreferences(): UseJobPreferencesReturn {
  const [preference, setPreference] = useState<JobPreferenceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await preferencesApi.get();
      setPreference(data);
    } catch (err) {
      // A 404 is expected when the user has never set preferences — treat as empty
      if (err instanceof Error && err.message.includes('404')) {
        setPreference(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const save = useCallback(async (data: JobPreferenceDTO) => {
    setSubmitting(true);
    try {
      // Both POST and PUT call saveOrUpdateJobPreference on the backend.
      // Always use POST — no need to branch on whether an id exists.
      const saved = await preferencesApi.save(data);
      setPreference(saved);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { preference, loading, error, refetch, save, submitting };
}