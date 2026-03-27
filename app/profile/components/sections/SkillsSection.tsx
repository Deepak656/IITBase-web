'use client';

import { useState, useRef } from 'react';
import SectionShell from '../../hooks/shared/SectionShell';
import SectionSkeleton from '../../hooks/shared/SectionSkeleton';
import type { SkillDTO, ProficiencyLevel } from '../../types/profile';
import { skillsApi } from '../../../../lib/profileApi';
import { useProfileSection } from '../../hooks/useProfileSection';

interface Props {
  skills: SkillDTO[];
  loading?: boolean;
  onRefresh: () => void;
}

const PROFICIENCY_COLORS: Record<ProficiencyLevel, string> = {
  BEGINNER: 'bg-gray-100 text-gray-600 border-gray-200',
  INTERMEDIATE: 'bg-blue-50 text-blue-700 border-blue-200',
  ADVANCED: 'bg-teal-50 text-teal-700 border-teal-200',
  EXPERT: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function SkillsSection({ skills, loading, onRefresh }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<ProficiencyLevel>('INTERMEDIATE');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { submitting, deleting, add, remove } = useProfileSection(skillsApi, onRefresh);

  const handleAddSkill = async () => {
    const name = inputValue.trim();
    if (!name) return;
    await add({ name, proficiencyLevel: selectedProficiency, displayOrder: skills.length });
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
    if (e.key === 'Escape') { setShowInput(false); setInputValue(''); }
  };

  if (loading) return <SectionSkeleton rows={1} />;

  return (
    <SectionShell
      title="Skills"
      onAdd={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      addLabel="Add skill"
      isEmpty={skills.length === 0 && !showInput}
      emptyTitle="No skills added yet"
      emptyMessage="Recruiters filter by skills. Add yours to show up in searches."
    >
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <SkillChip
            key={skill.id ?? idx}
            skill={skill}
            onDelete={() => skill.id && remove(skill.id)}
            deleting={deleting === skill.id}
          />
        ))}

        {/* Inline add input */}
        {showInput ? (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Skill name…"
              className="bg-transparent text-sm text-gray-800 outline-none w-32"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            />
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value as ProficiencyLevel)}
              className="text-xs bg-transparent text-gray-500 outline-none cursor-pointer"
            >
              {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as ProficiencyLevel[]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={handleAddSkill}
              disabled={submitting || !inputValue.trim()}
              className="text-teal-600 hover:text-teal-700 disabled:opacity-40 transition-colors"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => { setShowInput(false); setInputValue(''); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          skills.length > 0 && (
            <button
              onClick={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-teal-600 border border-dashed border-gray-300 hover:border-teal-400 rounded-lg transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add skill
            </button>
          )
        )}
      </div>
    </SectionShell>
  );
}

function SkillChip({
  skill,
  onDelete,
  deleting,
}: {
  skill: SkillDTO;
  onDelete: () => void;
  deleting: boolean;
}) {
  const colorClass =
    PROFICIENCY_COLORS[skill.proficiencyLevel as ProficiencyLevel] ??
    PROFICIENCY_COLORS.INTERMEDIATE;

  return (
    <div
      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${colorClass}`}
    >
      <span style={{ fontFamily: 'Roboto, sans-serif' }}>{skill.name}</span>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-red-500"
      >
        {deleting ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
}