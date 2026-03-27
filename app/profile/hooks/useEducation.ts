'use client';

import { useState, useEffect, useCallback } from 'react';
import { educationApi } from '../../../lib/profileApi';
import type { EducationDTO } from '../types/profile';

interface UseEducationReturn {
  educations: EducationDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  add: (data: EducationDTO) => Promise<void>;
  update: (id: number, data: EducationDTO) => Promise<void>;
  remove: (id: number) => Promise<void>;
  submitting: boolean;
  deleting: number | null;
}

export function useEducation(): UseEducationReturn {
  const [educations, setEducations] = useState<EducationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await educationApi.getAll();
      setEducations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load education');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const add = useCallback(async (data: EducationDTO) => {
    setSubmitting(true);
    try {
      await educationApi.add(data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const update = useCallback(async (id: number, data: EducationDTO) => {
    setSubmitting(true);
    try {
      await educationApi.update(id, data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const remove = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await educationApi.delete(id);
      await refetch();
    } finally {
      setDeleting(null);
    }
  }, [refetch]);

  return { educations, loading, error, refetch, add, update, remove, submitting, deleting };
}