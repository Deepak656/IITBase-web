'use client';

// ═══════════════════════════════════════════════════════════════════════════
// components/AdminSplitPage.tsx
// Reusable master-detail split panel for all admin entity pages.
//
// Usage:
//   <AdminSplitPage
//     rows={rows}
//     columns={columns}
//     detail={selectedId ? <YourDetail id={selectedId} /> : null}
//     selectedId={selectedId}
//     onSelect={setSelectedId}
//     loading={loading}
//     totalPages={totalPages}
//     page={page}
//     onPageChange={setPage}
//     filterBar={<YourFilters />}
//     title="Companies"
//     totalElements={totalElements}
//   />
// ═══════════════════════════════════════════════════════════════════════════

import { ReactNode } from 'react';

export interface SplitColumn<T> {
  key: string;
  label: string;
  width?: number;
  render: (row: T) => ReactNode;
}

interface AdminSplitPageProps<T extends { id: number }> {
  title: string;
  totalElements: number;
  rows: T[];
  columns: SplitColumn<T>[];
  detail: ReactNode;           // rendered when a row is selected
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
  totalPages: number;
  page: number;
  onPageChange: (p: number) => void;
  filterBar?: ReactNode;
  actionButton?: ReactNode;    // e.g. "Post a job" CTA
  emptyText?: string;
}

export function AdminSplitPage<T extends { id: number }>({
  title,
  totalElements,
  rows,
  columns,
  detail,
  selectedId,
  onSelect,
  loading,
  totalPages,
  page,
  onPageChange,
  filterBar,
  actionButton,
  emptyText = 'No items found.',
}: AdminSplitPageProps<T>) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'var(--app-font-body)',
    }}>

      {/* ── Left: list ─────────────────────────────────────────────────── */}
      <div style={{
        width: selectedId ? 420 : '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: selectedId ? '1px solid var(--app-border)' : 'none',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--app-border)',
          background: 'var(--app-bg-white)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: filterBar ? 12 : 0 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--app-font-display)',
                fontSize: 18, fontWeight: 500,
                color: 'var(--app-text-primary)',
                letterSpacing: '-0.2px', margin: 0,
              }}>
                {title}
              </h1>
              <p style={{ fontSize: 12, color: 'var(--app-text-faint)', margin: '3px 0 0' }}>
                {totalElements} total
              </p>
            </div>
            {actionButton}
          </div>
          {filterBar}
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--app-bg-white)' }}>
          {/* Column headers */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '8px 16px',
            background: 'var(--app-bg)',
            borderBottom: '1px solid var(--app-border)',
            position: 'sticky', top: 0, zIndex: 1,
          }}>
            {columns.map(col => (
              <div key={col.key} style={{
                flex: col.width ? `0 0 ${col.width}px` : 1,
                fontSize: 11, fontWeight: 600,
                color: 'var(--app-text-faint)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                paddingRight: 12, minWidth: 0,
              }}>
                {col.label}
              </div>
            ))}
          </div>

          {loading ? (
            <div>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--app-border)',
                  gap: 12,
                }}>
                  {columns.map(col => (
                    <div key={col.key} style={{ flex: col.width ? `0 0 ${col.width}px` : 1 }}>
                      <div className="app-skeleton" style={{ height: 12, width: '70%' }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center',
              color: 'var(--app-text-faint)', fontSize: 13,
            }}>
              {emptyText}
            </div>
          ) : (
            rows.map(row => (
              <div
                key={row.id}
                onClick={() => onSelect(row.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: '1px solid var(--app-border)',
                  cursor: 'pointer',
                  background: selectedId === row.id
                    ? 'var(--app-accent-dim)'
                    : 'none',
                  transition: 'background 0.1s',
                  borderLeft: selectedId === row.id
                    ? '2px solid var(--app-accent)'
                    : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (selectedId !== row.id)
                    (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-hover)';
                }}
                onMouseLeave={e => {
                  if (selectedId !== row.id)
                    (e.currentTarget as HTMLElement).style.background = 'none';
                }}
              >
                {columns.map(col => (
                  <div key={col.key} style={{
                    flex: col.width ? `0 0 ${col.width}px` : 1,
                    paddingRight: 12, minWidth: 0,
                    overflow: 'hidden',
                  }}>
                    {col.render(row)}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '10px 16px',
            borderTop: '1px solid var(--app-border)',
            background: 'var(--app-bg-white)',
            flexShrink: 0,
          }}>
            <button
              className="app-btn app-btn-secondary app-btn-sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              className="app-btn app-btn-secondary app-btn-sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >Next →</button>
          </div>
        )}
      </div>

      {/* ── Right: detail panel ─────────────────────────────────────────── */}
      {selectedId && (
        <div style={{
          flex: 1, overflow: 'auto',
          background: 'var(--app-bg)',
          minWidth: 0,
        }}>
          {detail}
        </div>
      )}

      {/* Empty detail state — full width, no row selected */}
      {!selectedId && rows.length > 0 && !loading && (
        <div /> /* nothing — list takes full width when no selection */
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Shared detail panel primitives
// ═══════════════════════════════════════════════════════════════════════════

export function DetailShell({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div style={{ padding: '24px 28px' }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--app-text-faint)', fontSize: 12,
            fontFamily: 'var(--app-font-body)',
            display: 'flex', alignItems: 'center', gap: 4,
            marginBottom: 16, padding: 0,
          }}
        >
          ← Back to list
        </button>
      )}
      {children}
    </div>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.8px',
        textTransform: 'uppercase', color: 'var(--app-text-faint)',
        marginBottom: 12,
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px 24px',
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

export function DetailField({ label, value, href, mono }: {
  label: string;
  value?: string | number | null;
  href?: string;
  mono?: boolean;
}) {
  if (!value && value !== 0) return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--app-text-faint)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--app-text-faint)', fontStyle: 'italic' }}>—</p>
    </div>
  );
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--app-text-faint)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, color: 'var(--app-accent)', textDecoration: 'none', wordBreak: 'break-all' }}>
          {value} ↗
        </a>
      ) : (
        <p style={{
          fontSize: 13, color: 'var(--app-text-primary)',
          fontFamily: mono ? 'monospace' : undefined,
          wordBreak: 'break-word', margin: 0,
        }}>
          {value}
        </p>
      )}
    </div>
  );
}

export function DetailDivider() {
  return <div style={{ height: 1, background: 'var(--app-border)', margin: '20px 0' }} />;
}

export function DetailLoading() {
  return (
    <div style={{ padding: '24px 28px' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div className="app-skeleton" style={{ height: 10, width: '20%', marginBottom: 8 }} />
          <div className="app-skeleton" style={{ height: 14, width: '50%' }} />
        </div>
      ))}
    </div>
  );
}

export function PersonCard({ label, email, name, phone, workEmail, designation, role, badge }: {
  label: string;
  email?: string;
  name?: string;
  phone?: string;
  workEmail?: string;
  designation?: string;
  role?: string;
  badge?: ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--app-bg-white)',
      border: '1px solid var(--app-border)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{ fontSize: 11, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'var(--app-bg-subtle)', border: '1px solid var(--app-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, color: 'var(--app-text-faint)',
        }}>
          {(name || email || '?')[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>
              {name ?? 'Unknown'}
            </span>
            {role && (
              <span style={{
                padding: '1px 7px', borderRadius: 20, fontSize: 11,
                background: 'var(--app-accent-dim)',
                border: '1px solid var(--app-accent-border)',
                color: 'var(--app-accent)',
              }}>{role}</span>
            )}
            {badge}
          </div>
          {designation && (
            <p style={{ fontSize: 12, color: 'var(--app-text-muted)', margin: '1px 0 0' }}>{designation}</p>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        {email && (
          <div>
            <p style={{ fontSize: 10, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Email</p>
            <p style={{ fontSize: 12, color: 'var(--app-text-secondary)', wordBreak: 'break-all', margin: 0 }}>{email}</p>
          </div>
        )}
        {workEmail && (
          <div>
            <p style={{ fontSize: 10, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Work email</p>
            <p style={{ fontSize: 12, color: 'var(--app-text-secondary)', wordBreak: 'break-all', margin: 0 }}>{workEmail}</p>
          </div>
        )}
        {phone && (
          <div>
            <p style={{ fontSize: 10, color: 'var(--app-text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Phone</p>
            <p style={{ fontSize: 12, color: 'var(--app-text-secondary)', margin: 0 }}>{phone}</p>
          </div>
        )}
      </div>
    </div>
  );
}