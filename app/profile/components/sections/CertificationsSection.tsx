'use client';

import { useState } from 'react';
import SectionShell from '../../hooks/shared/SectionShell';
import SectionSkeleton from '../../hooks/shared/SectionSkeleton';
import CertificationCard from '../../cards/CertificationCard';
import CertificationModal from '../../forms/CertificationForm';
import type { CertificationDTO } from '../../types/profile';
import { certificationsApi } from '../../../../lib/profileApi';

interface Props {
  certifications: CertificationDTO[];
  loading?: boolean;
  onRefetch: () => Promise<void>;
}

export default function CertificationsSection({ certifications, loading, onRefetch }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CertificationDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: CertificationDTO) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this certification?')) return;
    setDeletingId(id);
    try {
      await certificationsApi.delete(id);
      await onRefetch();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SectionSkeleton rows={2} />;

  return (
    <>
      <SectionShell
        title="Certifications"
        onAdd={openAdd}
        addLabel="Add certification"
        isEmpty={certifications.length === 0}
        emptyTitle="No certifications added yet"
        emptyMessage="Add certifications from AWS, Google, Coursera, or anywhere else."
      >
        <div className="space-y-4">
          {certifications.map((cert, idx) => (
            <div key={cert.id ?? idx}>
              {idx > 0 && <div className="border-t border-gray-100 mb-4" />}
              <CertificationCard
                cert={cert}
                onEdit={() => openEdit(cert)}
                onDelete={() => cert.id && handleDelete(cert.id)}
                deleting={deletingId === cert.id}
              />
            </div>
          ))}
        </div>
      </SectionShell>

      <CertificationModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={onRefetch}
      />
    </>
  );
}