'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../../../lib/profileApi';
import type { ProjectDTO } from '../types/profile';

interface UseProjectsReturn {
  projects: ProjectDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  add: (data: ProjectDTO) => Promise<void>;
  update: (id: number, data: ProjectDTO) => Promise<void>;
  remove: (id: number) => Promise<void>;
  submitting: boolean;
  deleting: number | null;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const add = useCallback(async (data: ProjectDTO) => {
    setSubmitting(true);
    try {
      await projectsApi.add(data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const update = useCallback(async (id: number, data: ProjectDTO) => {
    setSubmitting(true);
    try {
      await projectsApi.update(id, data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const remove = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await projectsApi.delete(id);
      await refetch();
    } finally {
      setDeleting(null);
    }
  }, [refetch]);

  return { projects, loading, error, refetch, add, update, remove, submitting, deleting };
}