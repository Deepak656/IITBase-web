'use client';

import { useState } from 'react';
import SectionShell from '../../hooks/shared/SectionShell';
import SectionSkeleton from '../../hooks/shared/SectionSkeleton';
import EducationCard from '../../cards/EducationCard';
import EducationModal from '../../forms/EducationForm';
import type { EducationDTO } from '../../types/profile';
import { educationApi } from '../../../../lib/profileApi';

interface Props {
  educations: EducationDTO[];
  loading?: boolean;
  onRefetch: () => Promise<void>;
}

export default function EducationSection({ educations, loading, onRefetch }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EducationDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (edu: EducationDTO) => { setEditing(edu); setModalOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this education entry?')) return;
    setDeletingId(id);
    try {
      await educationApi.delete(id);
      await onRefetch();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SectionSkeleton rows={2} />;

  return (
    <>
      <SectionShell
        title="Education"
        onAdd={openAdd}
        addLabel="Add education"
        isEmpty={educations.length === 0}
        emptyTitle="No education added yet"
        emptyMessage="Add your degrees, diplomas, and courses."
      >
        <div className="space-y-5">
          {educations.map((edu, idx) => (
            <div key={edu.id ?? idx}>
              {idx > 0 && <div className="border-t border-gray-100 mb-5" />}
              <EducationCard
                edu={edu}
                onEdit={() => openEdit(edu)}
                onDelete={() => edu.id && handleDelete(edu.id)}
                deleting={deletingId === edu.id}
              />
            </div>
          ))}
        </div>
      </SectionShell>

      <EducationModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={onRefetch}
      />
    </>
  );
}