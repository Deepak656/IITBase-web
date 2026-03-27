'use client';

import { useState, useEffect, useCallback } from 'react';
import { experienceApi } from '../../../lib/profileApi';
import type { WorkExperienceDTO } from '../types/profile';

interface UseExperienceReturn {
  experiences: WorkExperienceDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  add: (data: WorkExperienceDTO) => Promise<void>;
  update: (id: number, data: WorkExperienceDTO) => Promise<void>;
  remove: (id: number) => Promise<void>;
  submitting: boolean;
  deleting: number | null;
}

export function useExperience(): UseExperienceReturn {
  const [experiences, setExperiences] = useState<WorkExperienceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await experienceApi.getAll();
      setExperiences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experience');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const add = useCallback(async (data: WorkExperienceDTO) => {
    setSubmitting(true);
    try {
      await experienceApi.add(data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const update = useCallback(async (id: number, data: WorkExperienceDTO) => {
    setSubmitting(true);
    try {
      await experienceApi.update(id, data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const remove = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await experienceApi.delete(id);
      await refetch();
    } finally {
      setDeleting(null);
    }
  }, [refetch]);

  return { experiences, loading, error, refetch, add, update, remove, submitting, deleting };
}