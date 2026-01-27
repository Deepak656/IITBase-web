'use client';

import { useState } from 'react';
import { PRIMARY_ROLES } from '../lib/constants';

interface Props {
  onFilterChange: (filters: Record<string, string>) => void;
}

export default function JobFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState({
    role: '',
    minExperience: '',
    maxExperience: '',
    location: '',
  });

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      role: '',
      minExperience: '',
      maxExperience: '',
      location: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Role
          </label>
          <select
            id="role"
            value={filters.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <option value="">All Roles</option>
            {PRIMARY_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Location
          </label>
          <input
            id="location"
            type="text"
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g. Remote, Bangalore"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Experience Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                value={filters.minExperience}
                onChange={(e) => handleChange('minExperience', e.target.value)}
                placeholder="Min"
                min="0"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>
            <div>
              <input
                type="number"
                value={filters.maxExperience}
                onChange={(e) => handleChange('maxExperience', e.target.value)}
                placeholder="Max"
                min="0"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Years of experience
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
          <h4 className="text-sm font-medium text-teal-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            About IITBase
          </h4>
          <p className="text-xs text-teal-800 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Every job listing is manually reviewed to ensure it targets tier-1 graduates. We verify quality, relevance, and authenticity.
          </p>
        </div>
      </div>
    </div>
  );
}