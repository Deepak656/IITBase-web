'use client';

import { useState, useEffect, useCallback } from 'react';
import { skillsApi } from '../../../lib/profileApi';
import type { SkillDTO } from '../types/profile';

interface UseSkillsReturn {
  skills: SkillDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  add: (data: SkillDTO) => Promise<void>;
  update: (id: number, data: SkillDTO) => Promise<void>;
  remove: (id: number) => Promise<void>;
  submitting: boolean;
  deleting: number | null;
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<SkillDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await skillsApi.getAll();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const add = useCallback(async (data: SkillDTO) => {
    setSubmitting(true);
    try {
      await skillsApi.add(data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const update = useCallback(async (id: number, data: SkillDTO) => {
    setSubmitting(true);
    try {
      await skillsApi.update(id, data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const remove = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await skillsApi.delete(id);
      await refetch();
    } finally {
      setDeleting(null);
    }
  }, [refetch]);

  return { skills, loading, error, refetch, add, update, remove, submitting, deleting };
}