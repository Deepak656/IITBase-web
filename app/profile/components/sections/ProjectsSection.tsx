'use client';

import { useState } from 'react';
import SectionShell from '../../hooks/shared/SectionShell';
import SectionSkeleton from '../../hooks/shared/SectionSkeleton';
import ProjectCard from '../../cards/ProjectCard';
import ProjectModal from '../../forms/ProjectForm';
import type { ProjectDTO } from '../../types/profile';
import { projectsApi } from '../../../../lib/profileApi';

interface Props {
  projects: ProjectDTO[];
  loading?: boolean;
  onRefetch: () => Promise<void>;
}

export default function ProjectsSection({ projects, loading, onRefetch }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: ProjectDTO) => { setEditing(p); setModalOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this project?')) return;
    setDeletingId(id);
    try {
      await projectsApi.delete(id);
      await onRefetch();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SectionSkeleton rows={2} />;

  return (
    <>
      <SectionShell
        title="Projects"
        onAdd={openAdd}
        addLabel="Add project"
        isEmpty={projects.length === 0}
        emptyTitle="No projects added yet"
        emptyMessage="Showcase your side projects, open source work, and builds."
      >
        <div className="space-y-5">
          {projects.map((project, idx) => (
            <div key={project.id ?? idx}>
              {idx > 0 && <div className="border-t border-gray-100 mb-5" />}
              <ProjectCard
                project={project}
                onEdit={() => openEdit(project)}
                onDelete={() => project.id && handleDelete(project.id)}
                deleting={deletingId === project.id}
              />
            </div>
          ))}
        </div>
      </SectionShell>

      <ProjectModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={onRefetch}
      />
    </>
  );
}