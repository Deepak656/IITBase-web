'use client';

import { useState, useCallback } from 'react';

interface SectionApi<T> {
  add: (data: T) => Promise<T>;
  update: (id: number, data: T) => Promise<T>;
  delete: (id: number) => Promise<null | void>;
}

interface UseProfileSectionReturn<T> {
  submitting: boolean;
  deleting: number | null;
  add: (data: T) => Promise<void>;
  update: (id: number, data: T) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export function useProfileSection<T>(
  api: SectionApi<T>,
  onRefresh: () => void,
): UseProfileSectionReturn<T> {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const add = useCallback(
    async (data: T) => {
      setSubmitting(true);
      try {
        await api.add(data);
        onRefresh();
      } finally {
        setSubmitting(false);
      }
    },
    [api, onRefresh],
  );

  const update = useCallback(
    async (id: number, data: T) => {
      setSubmitting(true);
      try {
        await api.update(id, data);
        onRefresh();
      } finally {
        setSubmitting(false);
      }
    },
    [api, onRefresh],
  );

  const remove = useCallback(
    async (id: number) => {
      if (!confirm('Are you sure you want to remove this entry?')) return;
      setDeleting(id);
      try {
        await api.delete(id);
        onRefresh();
      } finally {
        setDeleting(null);
      }
    },
    [api, onRefresh],
  );

  return { submitting, deleting, add, update, remove };
}