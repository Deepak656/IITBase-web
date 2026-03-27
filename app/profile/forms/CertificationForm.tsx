'use client';

import { useState, useEffect } from 'react';
import type { CertificationDTO } from '../types/profile';
import { MONTH_NAMES } from '../types/profile';
import { certificationsApi } from '../../../lib/profileApi';

interface CertificationModalProps {
  open: boolean;
  initial: CertificationDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);
const FUTURE_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i);

const EMPTY: CertificationDTO = {
  name: '', issuer: '',
  issueMonth: undefined, issueYear: undefined,
  expiryMonth: undefined, expiryYear: undefined,
  doesNotExpire: false,
  credentialId: '', credentialUrl: '',
};

export default function CertificationModal({ open, initial, onClose, onSaved }: CertificationModalProps) {
  const [form, setForm] = useState<CertificationDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setForm(initial ?? EMPTY); setError(null); }
  }, [open, initial]);

  if (!open) return null;

  const set = (field: keyof CertificationDTO, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Certification name is required');
    if (!form.issuer.trim()) return setError('Issuing organisation is required');
    setSaving(true); setError(null);
    try {
      if (initial?.id) {
        await certificationsApi.update(initial.id, form);
      } else {
        await certificationsApi.add(form);
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
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
            {initial ? 'Edit certification' : 'Add certification'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Name *</label>
            <input className="input text-sm" placeholder="AWS Solutions Architect" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Issuing organisation *</label>
            <input className="input text-sm" placeholder="Amazon Web Services" value={form.issuer} onChange={e => set('issuer', e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Issue date</label>
            <div className="flex gap-2">
              <select className="input text-sm flex-1" value={form.issueMonth ?? ''} onChange={e => set('issueMonth', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Month</option>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className="input text-sm flex-1" value={form.issueYear ?? ''} onChange={e => set('issueYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-600">Expiry date</label>
              <div className="flex items-center gap-1.5">
                <input type="checkbox" id="noExpiry" className="w-3.5 h-3.5 rounded border-gray-300 text-teal-600" checked={!!form.doesNotExpire} onChange={e => set('doesNotExpire', e.target.checked)} />
                <label htmlFor="noExpiry" className="text-xs text-gray-500 cursor-pointer">No expiry</label>
              </div>
            </div>
            <div className="flex gap-2">
              <select className="input text-sm flex-1" value={form.expiryMonth ?? ''} disabled={!!form.doesNotExpire} onChange={e => set('expiryMonth', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Month</option>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className="input text-sm flex-1" value={form.expiryYear ?? ''} disabled={!!form.doesNotExpire} onChange={e => set('expiryYear', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">Year</option>
                {[...YEARS, ...FUTURE_YEARS].sort((a, b) => b - a).filter((v, i, arr) => arr.indexOf(v) === i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Credential ID</label>
            <input className="input text-sm" placeholder="ABC-123-XYZ" value={form.credentialId ?? ''} onChange={e => set('credentialId', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Credential URL</label>
            <input className="input text-sm" placeholder="https://verify.example.com/…" value={form.credentialUrl ?? ''} onChange={e => set('credentialUrl', e.target.value)} />
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