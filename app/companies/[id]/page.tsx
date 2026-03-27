'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { companyApi, CompanyResponse } from '@/lib/recruiterApi';

export default function CompanyEditPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data: CompanyResponse = await companyApi.get(Number(id));

        setForm({
          name: data.name || '',
          website: data.website || '',
          industry: data.industry || '',
          size: data.size || '',
          description: data.description || '',
          logoUrl: data.logoUrl || '',
        });
      } catch {
        setError('Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCompany();
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Company name is required');
      return;
    }

    setSaving(true);
    try {
      await companyApi.update(Number(id), {
        name: form.name,
        website: form.website,
        industry: form.industry,
        size: form.size as any,
        description: form.description,
        logoUrl: form.logoUrl,
      });

      setSuccess('Changes submitted for admin approval');
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-1">Edit Company</h1>
      <p className="text-sm text-gray-500 mb-6">
        Changes require admin approval before going live
      </p>

      <div className="space-y-6 bg-white p-6 rounded-xl border">

        {/* Basic Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Basic Information
          </h2>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Company Name"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />

            <input
              className="input"
              placeholder="Website"
              value={form.website}
              onChange={e => handleChange('website', e.target.value)}
            />

            <input
              className="input"
              placeholder="Industry"
              value={form.industry}
              onChange={e => handleChange('industry', e.target.value)}
            />
          </div>
        </div>

        {/* Company Details */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Company Details
          </h2>
          <div className="space-y-3">
            <select
              className="input"
              value={form.size}
              onChange={e => handleChange('size', e.target.value)}
            >
              <option value="">Select size</option>
              <option value="STARTUP">Startup</option>
              <option value="SME">SME</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>

            <textarea
              className="input"
              placeholder="Description"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>
        </div>

        {/* Branding */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Branding
          </h2>

          <input
            className="input"
            placeholder="Logo URL"
            value={form.logoUrl}
            onChange={e => handleChange('logoUrl', e.target.value)}
          />

          {form.logoUrl && (
            <div className="flex items-center gap-3 mt-3">
              <img
                src={form.logoUrl}
                className="h-12 w-12 rounded-lg border object-contain bg-white"
                alt="logo"
              />
              <span className="text-sm text-gray-500">Preview</span>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {success && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}