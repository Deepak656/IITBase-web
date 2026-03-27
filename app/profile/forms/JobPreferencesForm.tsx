'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobPreferenceDTO, WorkLocationType, NoticePeriod } from '../types/profile';
import { WORK_LOCATION_LABELS, NOTICE_PERIOD_LABELS } from '../types/profile';
import { preferencesApi } from '../../../lib/profileApi';

interface JobPreferencesFormProps {
  preference: JobPreferenceDTO | null;
  onSaved: () => Promise<void>;
}

const LOCATION_OPTIONS: WorkLocationType[] = ['REMOTE', 'HYBRID', 'ONSITE'];
const NOTICE_OPTIONS: NoticePeriod[] = [
  'IMMEDIATE',
  '15_DAYS',
  '30_DAYS',
  '60_DAYS',
  '90_DAYS',
];

type SaveState = 'idle' | 'saving' | 'saved';

export default function JobPreferencesForm({ preference, onSaved }: JobPreferencesFormProps) {
  const [form, setForm] = useState<Partial<JobPreferenceDTO>>(preference ?? {});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [cityInput, setCityInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (preference) setForm(preference);
  }, [preference]);

  const persist = useCallback(
    async (patch: Partial<JobPreferenceDTO>) => {
      setSaveState('saving');
      try {
        // Both POST and PUT are equivalent on the backend
        await preferencesApi.save(patch as JobPreferenceDTO);
        await onSaved();
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch {
        setSaveState('idle');
      }
    },
    [onSaved],
  );

  const set = useCallback(
    (field: keyof JobPreferenceDTO, value: unknown) => {
      const updated = { ...form, [field]: value };
      setForm(updated);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(updated), 800);
    },
    [form, persist],
  );

  const addCity = () => {
    const city = cityInput.trim();
    if (!city) return;
    const existing = form.preferredCities ?? [];
    if (existing.includes(city)) { setCityInput(''); return; }
    set('preferredCities', [...existing, city]);
    setCityInput('');
  };

  const removeCity = (city: string) => {
    set('preferredCities', (form.preferredCities ?? []).filter((c) => c !== city));
  };

  return (
    <div className="space-y-4">
      {/* Save indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Preferences
        </span>
        {saveState === 'saving' && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
            Saving
          </div>
        )}
        {saveState === 'saved' && (
          <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Saved
          </span>
        )}
      </div>

      {/* Work type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Work type</label>
        <div className="flex gap-2 flex-wrap">
          {LOCATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => set('workLocationType', opt)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                form.workLocationType === opt
                  ? 'bg-teal-50 border-teal-300 text-teal-700 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {WORK_LOCATION_LABELS[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* Current location */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Current location
        </label>
        <input
          className="input text-sm"
          placeholder="Bengaluru, India"
          value={form.currentLocation ?? ''}
          onChange={(e) => set('currentLocation', e.target.value)}
        />
      </div>

      {/* Preferred cities */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Open to cities</label>
        {(form.preferredCities ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(form.preferredCities ?? []).map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200"
              >
                {city}
                <button
                  onClick={() => removeCity(city)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="input text-sm flex-1"
            placeholder="Add a city"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addCity(); }
            }}
          />
          <button
            onClick={addCity}
            className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Primary role */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Primary role</label>
        <input
          className="input text-sm"
          placeholder="Backend Engineer"
          value={form.primaryRole ?? ''}
          onChange={(e) => set('primaryRole', e.target.value)}
        />
      </div>

      {/* Expected salary */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Expected salary (LPA)
        </label>
        <div className="flex gap-2">
          <select
            className="input text-sm w-12"
            value={form.expectedSalaryCurrency ?? 'INR'}
            onChange={(e) => set('expectedSalaryCurrency', e.target.value)}
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
          <input
            type="number"
            className="input text-sm"
            placeholder="24"
            min={0}
            value={form.expectedSalary ?? ''}
            onChange={(e) =>
              set('expectedSalary', e.target.value ? parseFloat(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      {/* Notice period — string enum from backend */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Notice period</label>
        <select
          className="input text-sm"
          value={form.noticePeriod ?? ''}
          onChange={(e) =>
            set('noticePeriod', (e.target.value as NoticePeriod) || undefined)
          }
        >
          <option value="">Select…</option>
          {NOTICE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {NOTICE_PERIOD_LABELS[opt]}
            </option>
          ))}
        </select>
      </div>

      {/* Open to roles */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Open to roles
          <span className="ml-1 text-gray-400 font-normal">(comma-separated)</span>
        </label>
        <input
          className="input text-sm"
          placeholder="Backend Engineer, Full Stack, SDE-2"
          value={form.openToRoles?.join(', ') ?? ''}
          onChange={(e) =>
            set(
              'openToRoles',
              e.target.value
                .split(',')
                .map((r) => r.trim())
                .filter(Boolean),
            )
          }
        />
      </div>
    </div>
  );
}