'use client';

import { useState } from 'react';
import { PRIMARY_ROLES } from '../lib/constants';

interface Props {
  onFilterChange: (filters: Record<string, string>) => void;
}

export default function JobFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState({
    role: '', minExperience: '', maxExperience: '', location: '',
  });

  const handleChange = (key: string, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const handleReset = () => {
    const empty = { role: '', minExperience: '', maxExperience: '', location: '' };
    setFilters(empty);
    onFilterChange(empty);
  };

  const hasActive = Object.values(filters).some(v => v !== '');

  return (
    <div className="app-card app-sidebar-sticky">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--app-font-display)', fontSize: 16, fontWeight: 500, color: 'var(--app-text-primary)', margin: 0 }}>
          Filters
        </h3>
        {hasActive && (
          <button onClick={handleReset}
            style={{ fontSize: 13, color: 'var(--app-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--app-font-body)' }}>
            Clear all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="app-label">Role</label>
          <select className="app-select" value={filters.role} onChange={e => handleChange('role', e.target.value)}>
            <option value="">All roles</option>
            {PRIMARY_ROLES.map(role => (
              <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="app-label">Location</label>
          <input
            className="app-input"
            type="text"
            value={filters.location}
            onChange={e => handleChange('location', e.target.value)}
            placeholder="Remote, Bengaluru…"
          />
        </div>

        <div>
          <label className="app-label">Experience (years)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              className="app-input"
              type="number" min="0"
              value={filters.minExperience}
              onChange={e => handleChange('minExperience', e.target.value)}
              placeholder="Min"
              style={{ marginBottom: 0 }}
            />
            <input
              className="app-input"
              type="number" min="0"
              value={filters.maxExperience}
              onChange={e => handleChange('maxExperience', e.target.value)}
              placeholder="Max"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--app-border)' }}>
        <div style={{
          background: 'var(--app-accent-dim)', border: '1px solid var(--app-accent-border)',
          borderRadius: 8, padding: '14px 16px',
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-accent)', marginBottom: 6 }}>
            About IITBase
          </h4>
          <p style={{ fontSize: 12, color: 'var(--app-text-muted)', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
            Every listing is manually reviewed for tier-1 relevance. We verify quality, authenticity, and fit.
          </p>
        </div>
      </div>
    </div>
  );
}