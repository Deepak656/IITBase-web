'use client';

import { useState } from 'react';
import SectionShell from '../../hooks/shared/SectionShell';
import SectionSkeleton from '../../hooks/shared/SectionSkeleton';
import ExperienceCard from '../../cards/ExperienceCard';
import ExperienceModal from '../../forms/ExperienceForm';
import type { WorkExperienceDTO } from '../../types/profile';
import { experienceApi } from '../../../../lib/profileApi';

interface Props {
  experiences: WorkExperienceDTO[];
  loading?: boolean;
  onRefetch: () => Promise<void>;
}

export default function ExperienceSection({ experiences, loading, onRefetch }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkExperienceDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (exp: WorkExperienceDTO) => { setEditing(exp); setModalOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this experience?')) return;
    setDeletingId(id);
    try {
      await experienceApi.delete(id);
      await onRefetch();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SectionSkeleton rows={2} />;

  return (
    <>
      <SectionShell
        title="Work Experience"
        onAdd={openAdd}
        addLabel="Add experience"
        isEmpty={experiences.length === 0}
        emptyTitle="No experience added yet"
        emptyMessage="Recruiters use this to assess fit. Even internships count."
      >
        <div className="space-y-5">
          {experiences.map((exp, idx) => (
            <div key={exp.id ?? idx}>
              {idx > 0 && <div className="border-t border-gray-100 mb-5" />}
              <ExperienceCard
                exp={exp}
                onEdit={() => openEdit(exp)}
                onDelete={() => exp.id && handleDelete(exp.id)}
                deleting={deletingId === exp.id}
              />
            </div>
          ))}
        </div>
      </SectionShell>

      <ExperienceModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={onRefetch}
      />
    </>
  );
}