'use client';

import { useState, useEffect } from 'react';
import type { WorkExperienceDTO, EmploymentType } from '../types/profile';
import { EMPLOYMENT_TYPE_LABELS, MONTH_NAMES } from '../types/profile';
import { experienceApi } from '../../../lib/profileApi';

interface ExperienceModalProps {
  open: boolean;
  initial: WorkExperienceDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);

const EMPTY: WorkExperienceDTO = {
  company: '',
  title: '',
  location: '',
  employmentType: 'FULL_TIME',
  startMonth: undefined,
  startYear: CURRENT_YEAR,
  endMonth: undefined,
  endYear: undefined,
  isCurrent: false,
  description: '',
  skillsUsed: '',
};

export default function ExperienceModal({ open, initial, onClose, onSaved }: ExperienceModalProps) {
  const [form, setForm] = useState<WorkExperienceDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY);
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (field: keyof WorkExperienceDTO, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.company.trim()) return setError('Company name is required');
    if (!form.title.trim()) return setError('Job title is required');
    if (!form.startYear) return setError('Start year is required');
    if (!form.isCurrent && !form.endYear) return setError('End year is required for past jobs');

    setSaving(true);
    setError(null);
    try {
      if (initial?.id) {
        await experienceApi.update(initial.id, form);
      } else {
        await experienceApi.add(form);
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
            {initial ? 'Edit experience' : 'Add experience'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Job Title *</label>
            <input className="input text-sm" placeholder="Software Engineer" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Company *</label>
            <input className="input text-sm" placeholder="Razorpay" value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
              <input className="input text-sm" placeholder="Bangalore" value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Employment type</label>
              <select className="input text-sm" value={form.employmentType ?? 'FULL_TIME'} onChange={e => set('employmentType', e.target.value as EmploymentType)}>
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start *</label>
              <div className="flex gap-2">
                <select className="input text-sm flex-1" value={form.startMonth ?? ''} onChange={e => set('startMonth', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Month</option>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select className="input text-sm flex-1" value={form.startYear ?? ''} onChange={e => set('startYear', parseInt(e.target.value))}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End</label>
              <div className="flex gap-2">
                <select className="input text-sm flex-1" value={form.endMonth ?? ''} disabled={!!form.isCurrent} onChange={e => set('endMonth', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Month</option>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select className="input text-sm flex-1" value={form.endYear ?? ''} disabled={!!form.isCurrent} onChange={e => set('endYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              className="w-4 h-4 rounded border-gray-300 text-teal-600"
              checked={!!form.isCurrent}
              onChange={e => {
                set('isCurrent', e.target.checked);
                if (e.target.checked) { set('endMonth', undefined); set('endYear', undefined); }
              }}
            />
            <label htmlFor="isCurrent" className="text-sm text-gray-600 cursor-pointer">I currently work here</label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea
              className="input text-sm resize-none"
              rows={3}
              placeholder="What did you build, own, or improve?"
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Skills used</label>
            <input
              className="input text-sm"
              placeholder="Java, Spring Boot, PostgreSQL, Redis"
              value={form.skillsUsed ?? ''}
              onChange={e => set('skillsUsed', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}