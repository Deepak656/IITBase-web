'use client';

import { useState, useEffect } from 'react';
import type { ProjectDTO } from '../types/profile';
import { MONTH_NAMES } from '../types/profile';
import { projectsApi } from '../../../lib/profileApi';

interface ProjectModalProps {
  open: boolean;
  initial: ProjectDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

const EMPTY: ProjectDTO = {
  title: '', description: '', techStack: '',
  projectUrl: '', repoUrl: '',
  startMonth: undefined, startYear: undefined,
  endMonth: undefined, endYear: undefined, isOngoing: false,
};

export default function ProjectModal({ open, initial, onClose, onSaved }: ProjectModalProps) {
  const [form, setForm] = useState<ProjectDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setForm(initial ?? EMPTY); setError(null); }
  }, [open, initial]);

  if (!open) return null;

  const set = (field: keyof ProjectDTO, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError('Project title is required');
    setSaving(true); setError(null);
    try {
      if (initial?.id) {
        await projectsApi.update(initial.id, form);
      } else {
        await projectsApi.add(form);
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
            {initial ? 'Edit project' : 'Add project'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Project title *</label>
            <input className="input text-sm" placeholder="IITBase Job Board" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea className="input text-sm resize-none" rows={3} placeholder="What you built, the problem it solves, key decisions…" value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tech stack</label>
            <input className="input text-sm" placeholder="Java, Spring Boot, Next.js, PostgreSQL" value={form.techStack ?? ''} onChange={e => set('techStack', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Live URL</label>
              <input className="input text-sm" placeholder="https://iitbase.com" value={form.projectUrl ?? ''} onChange={e => set('projectUrl', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">GitHub</label>
              <input className="input text-sm" placeholder="github.com/…" value={form.repoUrl ?? ''} onChange={e => set('repoUrl', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Started</label>
              <div className="flex gap-2">
                <select className="input text-sm flex-1" value={form.startMonth ?? ''} onChange={e => set('startMonth', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Month</option>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select className="input text-sm flex-1" value={form.startYear ?? ''} onChange={e => set('startYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Ended</label>
              <div className="flex gap-2">
                <select className="input text-sm flex-1" value={form.endMonth ?? ''} disabled={!!form.isOngoing} onChange={e => set('endMonth', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Month</option>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select className="input text-sm flex-1" value={form.endYear ?? ''} disabled={!!form.isOngoing} onChange={e => set('endYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isOngoing" className="w-4 h-4 rounded border-gray-300 text-teal-600" checked={!!form.isOngoing} onChange={e => set('isOngoing', e.target.checked)} />
            <label htmlFor="isOngoing" className="text-sm text-gray-600 cursor-pointer">Still working on this</label>
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