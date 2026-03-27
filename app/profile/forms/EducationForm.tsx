'use client';

import { useState, useEffect } from 'react';
import type { EducationDTO, GradeType } from '../types/profile';
import { educationApi } from '../../../lib/profileApi';

interface EducationModalProps {
  open: boolean;
  initial: EducationDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR + 5 - i);

const EMPTY: EducationDTO = {
  institution: '', degree: '', fieldOfStudy: '',
  startYear: undefined, endYear: undefined,
  grade: '', gradeType: 'CGPA', description: '',
};

export default function EducationModal({ open, initial, onClose, onSaved }: EducationModalProps) {
  const [form, setForm] = useState<EducationDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setForm(initial ?? EMPTY); setError(null); }
  }, [open, initial]);

  if (!open) return null;

  const set = (field: keyof EducationDTO, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.institution.trim()) return setError('Institution is required');
    if (!form.degree.trim()) return setError('Degree is required');

    setSaving(true); setError(null);
    try {
      if (initial?.id) {
        await educationApi.update(initial.id, form);
      } else {
        await educationApi.add(form);
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
            {initial ? 'Edit education' : 'Add education'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Institution *</label>
            <input className="input text-sm" placeholder="IIT Bombay" value={form.institution} onChange={e => set('institution', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Degree *</label>
              <input className="input text-sm" placeholder="B.Tech" value={form.degree} onChange={e => set('degree', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Field of study</label>
              <input className="input text-sm" placeholder="Computer Science" value={form.fieldOfStudy ?? ''} onChange={e => set('fieldOfStudy', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start year</label>
              <select className="input text-sm" value={form.startYear ?? ''} onChange={e => set('startYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End year</label>
              <select className="input text-sm" value={form.endYear ?? ''} onChange={e => set('endYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Grade</label>
              <input className="input text-sm" placeholder="8.5" value={form.grade ?? ''} onChange={e => set('grade', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Grade type</label>
              <select className="input text-sm" value={form.gradeType ?? 'CGPA'} onChange={e => set('gradeType', e.target.value as GradeType)}>
                <option value="CGPA">CGPA</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="GPA">GPA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea className="input text-sm resize-none" rows={2} placeholder="Relevant coursework, projects, achievements…" value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}