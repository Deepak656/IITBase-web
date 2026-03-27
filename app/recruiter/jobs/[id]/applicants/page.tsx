'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  applicationApi,
  type ApplicationDetailResponse,
  type ApplicationStatus,
  type StatusHistoryItem,
} from '../../../../../lib/recruiterApi';

const PIPELINE_COLS: ApplicationStatus[] = [
  'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED',
];
const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED:    'bg-blue-50 text-blue-700 border-blue-200',
  SCREENING:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  INTERVIEW:  'bg-orange-50 text-orange-700 border-orange-200',
  OFFER:      'bg-purple-50 text-purple-700 border-purple-200',
  HIRED:      'bg-green-50 text-green-700 border-green-200',
  REJECTED:   'bg-red-50 text-red-600 border-red-200',
  WITHDRAWN:  'bg-gray-100 text-gray-500 border-gray-200',
};

const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED:   ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER:     ['HIRED', 'REJECTED'],
  HIRED: [], REJECTED: [], WITHDRAWN: [],
};

function TimelineItem({ item }: { item: StatusHistoryItem }) {
  return (
    <div className="flex gap-3 text-xs">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-0.5" />
        <div className="w-px flex-1 bg-gray-200 mt-1" />
      </div>
      <div className="pb-3">
        <p className="font-medium text-gray-700">
          {item.fromStatus ? `${item.fromStatus} → ` : ''}{item.toStatus}
        </p>
        {item.note && <p className="text-gray-500 mt-0.5">{item.note}</p>}
        <p className="text-gray-400 mt-0.5">{item.changedAt.slice(0, 16).replace('T', ' ')}</p>
      </div>
    </div>
  );
}

function ApplicantDetail({
  app, history, onStatusUpdate, onClose,
}: {
  app: ApplicationDetailResponse;
  history: StatusHistoryItem[];
  onStatusUpdate: (id: number, status: ApplicationStatus, note: string) => Promise<void>;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(app.recruiterNotes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [movingStatus, setMovingStatus] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextStatuses = NEXT_STATUSES[app.status] ?? [];

  const handleNotesChange = (v: string) => {
    setNotes(v);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      setSavingNotes(true);
      try {
        await applicationApi.updateNotes(app.id, v);
        setNotesSaved(true);
      } catch { /* silent */ }
      finally { setSavingNotes(false); }
    }, 1000);
  };

  const handleMoveStatus = async () => {
    if (!selectedStatus) return;
    setMovingStatus(true);
    try {
      await onStatusUpdate(app.id, selectedStatus, statusNote);
      setSelectedStatus('');
      setStatusNote('');
    } finally { setMovingStatus(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{app.jobTitle}</h2>
            <p className="text-xs text-gray-500">Applicant #{app.jobseekerId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[app.status]}`}>
              {app.status}
            </span>
            <span className="text-xs text-gray-400">Applied {app.appliedAt.slice(0, 10)}</span>
          </div>

          {/* Resume */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Resume</p>
            <a
              href={app.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-teal-600 hover:bg-teal-50 transition-colors"
            >
              📄 View / Download Resume
            </a>
          </div>

          {/* Cover note */}
          {app.coverNote && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Cover note</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                {app.coverNote}
              </p>
            </div>
          )}

          {/* Move status */}
          {nextStatuses.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Move pipeline
              </p>
              <div className="flex gap-2 flex-wrap mb-2">
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(prev => prev === s ? '' : s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      selectedStatus === s
                        ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {selectedStatus && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder={`Add a note for ${selectedStatus} (optional)`}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <button
                    onClick={handleMoveStatus}
                    disabled={movingStatus}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {movingStatus ? 'Updating…' : `Move to ${selectedStatus} →`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Private notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Private notes
              </p>
              {savingNotes && <span className="text-xs text-gray-400">Saving…</span>}
              {notesSaved && <span className="text-xs text-teal-600">✓ Saved</span>}
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder="Add private notes about this candidate — not visible to them"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Status history
            </p>
            <div>
              {history.map((h, i) => <TimelineItem key={i} item={h} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicantPipelinePage() {
  const params = useParams();
  const jobId = Number(params.id);

  const [apps, setApps] = useState<ApplicationDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{
    app: ApplicationDetailResponse;
    history: StatusHistoryItem[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getApplicants(jobId, page, 50);
      setApps(data.applications ?? []);
      setTotalItems(data.totalItems);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [jobId, page]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleCardClick = async (app: ApplicationDetailResponse) => {
    setDetailLoading(true);
    try {
      const detail = await applicationApi.getApplicationDetail(app.id);
      setSelected({ app: detail.application, history: detail.history });
    } catch { /* silent */ }
    finally { setDetailLoading(false); }
  };

  const handleStatusUpdate = async (
    id: number, status: ApplicationStatus, note: string
  ) => {
    await applicationApi.updateStatus(id, { status, note });
    await fetchApps();
    // Refresh selected panel
    if (selected?.app.id === id) {
      const detail = await applicationApi.getApplicationDetail(id);
      setSelected({ app: detail.application, history: detail.history });
    }
  };

  // Group by status
  const grouped = PIPELINE_COLS.reduce((acc, col) => {
    acc[col] = apps.filter(a => a.status === col);
    return acc;
  }, {} as Record<ApplicationStatus, ApplicationDetailResponse[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Applicant pipeline</h1>
          <p className="text-sm text-gray-500">{totalItems} applicant{totalItems !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto grid grid-cols-6 gap-3">
            {PIPELINE_COLS.map(col => (
              <div key={col} className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <div className="grid grid-cols-6 gap-3 min-w-[900px]">
              {PIPELINE_COLS.map(col => (
                <div key={col}>
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[col]}`}>
                      {col}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {grouped[col].length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {grouped[col].map(app => (
                      <button
                        key={app.id}
                        onClick={() => handleCardClick(app)}
                        disabled={detailLoading}
                        className="w-full text-left bg-white border border-gray-200 rounded-xl p-3 hover:border-teal-300 hover:shadow-sm transition-all"
                      >
                        <p className="text-xs font-medium text-gray-800 mb-1">
                          Applicant #{app.jobseekerId}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{app.jobTitle}</p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {app.appliedAt.slice(0, 10)}
                        </p>
                        {app.recruiterNotes && (
                          <p className="text-xs text-teal-600 mt-1 truncate">📝 Has notes</p>
                        )}
                      </button>
                    ))}

                    {grouped[col].length === 0 && (
                      <div className="border-2 border-dashed border-gray-100 rounded-xl py-6 text-center">
                        <p className="text-xs text-gray-300">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <ApplicantDetail
          app={selected.app}
          history={selected.history}
          onStatusUpdate={handleStatusUpdate}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}