'use client';

import { useEffect, useState } from 'react';
import { recruiterApi } from '@/lib/recruiterApi';
import { userApi } from '../../../lib/userApi';
import type { RecruiterProfileResponse } from '@/lib/recruiterApi';

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  );
}

interface EditableFields {
  name: string;
  designation: string;
}

export default function RecruiterProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<RecruiterProfileResponse | null>(null);
  const [email, setEmail] = useState('');
  const [fields, setFields] = useState<EditableFields>({ name: '', designation: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Parallel — recruiter profile and auth identity are independent
        const [profileData, userData] = await Promise.all([
          recruiterApi.getMyProfile(),
          userApi.user.me(),
        ]);
        setProfile(profileData);
        setEmail(userData.email);
        setFields({
          name: profileData.name ?? '',
          designation: profileData.designation ?? '',
        });
      } catch {
        setError('Failed to load profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!fields.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await recruiterApi.updateMyProfile({
        name: fields.name.trim(),
        designation: fields.designation.trim() || undefined,
      });
      setSuccess('Profile updated successfully');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof EditableFields, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="h-7 bg-gray-100 rounded w-32 mb-6 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 animate-pulse">
          <div className="p-6 space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
                <div className="h-5 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
          {error || 'Unable to load profile. Please refresh the page.'}
        </div>
      </div>
    );
  }

  const joinedOn = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

return (
  <div className="max-w-5xl mx-auto p-6">
    <div className="grid md:grid-cols-3 gap-6">

      {/* ───────── LEFT: PROFILE CARD ───────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">

        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700">
            {fields.name?.charAt(0) || 'R'}
          </div>

          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {fields.name || 'Your Name'}
          </h2>

          <p className="text-sm text-gray-500">
            {fields.designation || 'Add designation'}
          </p>

          <span className={`mt-2 px-3 py-1 text-xs rounded-full border ${
            profile.isAdmin
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {profile.isAdmin ? 'Admin' : 'Recruiter'}
          </span>
        </div>

        {/* Company */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-400 uppercase mb-1">Company</p>
          <p className="text-sm font-medium text-gray-900">
            {profile.company?.name ?? '—'}
          </p>

          {profile.company?.website && (
            <a
              href={profile.company.website}
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              {profile.company.website}
            </a>
          )}
        </div>

        {/* Email */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Email</p>
          <p className="text-sm text-gray-900">{email}</p>
        </div>

        {/* Joined */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Joined</p>
          <p className="text-sm text-gray-900">{joinedOn}</p>
        </div>
      </div>

      {/* ───────── RIGHT: EDIT FORM ───────── */}
      <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">

        <h2 className="text-lg font-semibold text-gray-900">
          Edit Profile
        </h2>

        {/* Name */}
        <div>
          <label className="text-xs text-gray-400 uppercase mb-1 block">
            Full Name *
          </label>
          <input
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Designation */}
        <div>
          <label className="text-xs text-gray-400 uppercase mb-1 block">
            Designation
          </label>
          <input
            value={fields.designation}
            onChange={(e) => set('designation', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Messages */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
);
}