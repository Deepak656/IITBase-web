'use client';

import { useState, useEffect, useCallback } from 'react';
import { certificationsApi } from '../../../lib/profileApi';
import type { CertificationDTO } from '../types/profile';

interface UseCertificationsReturn {
  certifications: CertificationDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  add: (data: CertificationDTO) => Promise<void>;
  update: (id: number, data: CertificationDTO) => Promise<void>;
  remove: (id: number) => Promise<void>;
  submitting: boolean;
  deleting: number | null;
}

export function useCertifications(): UseCertificationsReturn {
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await certificationsApi.getAll();
      setCertifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const add = useCallback(async (data: CertificationDTO) => {
    setSubmitting(true);
    try {
      await certificationsApi.add(data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const update = useCallback(async (id: number, data: CertificationDTO) => {
    setSubmitting(true);
    try {
      await certificationsApi.update(id, data);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }, [refetch]);

  const remove = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await certificationsApi.delete(id);
      await refetch();
    } finally {
      setDeleting(null);
    }
  }, [refetch]);

  return { certifications, loading, error, refetch, add, update, remove, submitting, deleting };
}