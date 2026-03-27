'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  companyApi,
  recruiterApi,
  teamApi,
  type CompanySize,
  type CompanySearchResult,
} from '../../../lib/recruiterApi';

// ── Step types ────────────────────────────────────────────────────────────────
type Step = 'WORK_EMAIL' | 'COMPANY' | 'PROFILE' | 'DONE';

interface WorkEmailForm {
  workEmail: string;
}

interface CompanyForm {
  mode: 'create' | 'join' | 'request';   // create new | auto-join | request approval
  // Create mode
  name: string;
  website: string;
  industry: string;
  size: CompanySize | '';
  description: string;
  // Join/request mode
  selectedCompany: CompanySearchResult | null;
  joinMessage: string;
}

interface ProfileForm {
  name: string;
  designation: string;
}

const COMPANY_SIZES: { value: CompanySize; label: string; sub: string }[] = [
  { value: 'STARTUP',    label: 'Startup',    sub: '1–200 employees' },
  { value: 'SME',        label: 'Mid-size',   sub: '200–2000 employees' },
  { value: 'ENTERPRISE', label: 'Enterprise', sub: '2000+ employees' },
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Consulting', 'Manufacturing', 'Healthcare',
  'Education', 'E-commerce', 'Media', 'Energy', 'Government',
  'Defence', 'Research', 'Other',
];

function extractDomain(email: string): string | null {
  const at = email.indexOf('@');
  if (at < 0) return null;
  const domain = email.substring(at + 1).toLowerCase().trim();
  const free = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return free.includes(domain) ? null : domain;
}

// ── Step dots ─────────────────────────────────────────────────────────────────
const STEPS: Step[] = ['WORK_EMAIL', 'COMPANY', 'PROFILE', 'DONE'];
const STEP_LABELS = ['Verify email', 'Your company', 'Your profile', 'All set'];

// ── Main component ────────────────────────────────────────────────────────────
export default function RecruiterOnboardingPage() {
  const router = useRouter();

  const [step, setStep]   = useState<Step>('WORK_EMAIL');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Resolved after company step
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false); // join request sent

  const [workForm, setWorkForm] = useState<WorkEmailForm>({ workEmail: '' });
  const [emailDomain, setEmailDomain] = useState<string | null>(null);

  const [company, setCompany] = useState<CompanyForm>({
    mode: 'create',
    name: '', website: '', industry: '', size: '', description: '',
    selectedCompany: null, joinMessage: '',
  });

  const [profile, setProfile] = useState<ProfileForm>({ name: '', designation: '' });

  // Company search state
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [searching, setSearching]       = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStepIdx = STEPS.indexOf(step);

  // ── Work email step ─────────────────────────────────────────────────────────
  const handleWorkEmailNext = () => {
    const domain = extractDomain(workForm.workEmail);
    setEmailDomain(domain);
    setError('');
    setStep('COMPANY');
  };

  // ── Company search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await companyApi.search(
          searchQuery, emailDomain ?? undefined
        );
        setSearchResults(results);
      } catch {
        // non-fatal
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [searchQuery, emailDomain]);

  // ── Company step submit ─────────────────────────────────────────────────────
  const handleCompanyNext = async () => {
    setError('');
    setSaving(true);

    try {
      if (company.mode === 'create') {
        if (!company.size) { setError('Please select company size'); setSaving(false); return; }
        const res = await companyApi.create({
          name:        company.name,
          website:     company.website || undefined,
          industry:    company.industry,
          size:        company.size as CompanySize,
          description: company.description || undefined,
          workEmail:   workForm.workEmail || undefined,
        });
        setCompanyId(res.id);
        setStep('PROFILE');

      } else if (company.mode === 'join' && company.selectedCompany) {
        // Path A: domain match — auto-join, go straight to profile
        setCompanyId(company.selectedCompany.id);
        setStep('PROFILE');

      } else if (company.mode === 'request' && company.selectedCompany) {
        // Path B: no domain match — send join request
        await companyApi.requestToJoin(company.selectedCompany.id, {
          message:   company.joinMessage || undefined,
          workEmail: workForm.workEmail || undefined,
        });
        setIsPending(true);
        setStep('DONE');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Profile step submit ─────────────────────────────────────────────────────
  const handleProfileSubmit = async () => {
    if (!companyId) return;
    if (!profile.name.trim()) { setError('Full name is required'); return; }
    if (!profile.designation.trim()) { setError('Designation is required'); return; }

    setError('');
    setSaving(true);

    try {
      if (company.mode === 'join' && company.selectedCompany?.domainMatch) {
        // Path A: use the domain auto-join endpoint from TeamService
        // (backend creates the recruiter profile and auto-assigns role)
        await recruiterApi.createProfile({
          companyId,
          name:        profile.name.trim(),
          designation: profile.designation.trim(),
        });
      } else {
        // Create profile normally (for newly created company)
        await recruiterApi.createProfile({
          companyId,
          name:        profile.name.trim(),
          designation: profile.designation.trim(),
        });
      }
      setStep('DONE');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ob-root {
          min-height: 100vh;
          background: #0a0f1e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .ob-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .ob-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          top: -200px; right: -150px; pointer-events: none;
        }

        .ob-glow-2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
          bottom: -100px; left: -100px; pointer-events: none;
        }

        .ob-wrap {
          width: 100%; max-width: 520px;
          position: relative; z-index: 1;
        }

        /* Logo */
        .ob-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 36px;
          justify-content: center;
        }

        .ob-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 9px; display: flex; align-items: center;
          justify-content: center; font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 600; color: white;
        }

        .ob-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 500; color: #f8fafc;
          letter-spacing: -0.3px;
        }

        /* Progress */
        .ob-progress {
          display: flex; align-items: flex-start;
          gap: 0; margin-bottom: 32px;
        }

        .ob-progress-item {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; position: relative;
        }

        .ob-progress-item:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 14px; left: calc(50% + 14px);
          width: calc(100% - 28px); height: 1px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s;
        }

        .ob-progress-item.done:not(:last-child)::after {
          background: rgba(99,102,241,0.4);
        }

        .ob-progress-circle {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #334155;
          margin-bottom: 8px;
          position: relative; z-index: 1;
        }

        .ob-progress-circle.active {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
        }

        .ob-progress-circle.done {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.12);
          color: #34d399;
        }

        .ob-progress-label {
          font-size: 11px; color: #334155; font-weight: 400; text-align: center;
        }

        .ob-progress-label.active { color: #94a3b8; }
        .ob-progress-label.done { color: #475569; }

        /* Card */
        .ob-card {
          background: rgba(15, 20, 40, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 40px;
          backdrop-filter: blur(20px);
          animation: ob-in 0.35s ease both;
        }

        @keyframes ob-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ob-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #818cf8; margin-bottom: 8px;
        }

        .ob-heading {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 500; color: #f8fafc;
          margin-bottom: 6px; letter-spacing: -0.3px; line-height: 1.3;
        }

        .ob-sub {
          font-size: 14px; color: #64748b; font-weight: 300;
          line-height: 1.6; margin-bottom: 28px;
        }

        /* Error */
        .ob-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; margin-bottom: 20px;
        }

        .ob-error-text { font-size: 13px; color: #fca5a5; line-height: 1.5; }

        /* Form */
        .ob-label {
          display: block; font-size: 12px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 7px;
        }

        .ob-input {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s; margin-bottom: 16px;
        }

        .ob-input::placeholder { color: #334155; }

        .ob-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
        }

        .ob-textarea {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; outline: none;
          resize: none; line-height: 1.6;
          transition: border-color 0.2s; margin-bottom: 16px;
        }

        .ob-textarea:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
        }

        .ob-select {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; outline: none;
          appearance: none; cursor: pointer;
          transition: border-color 0.2s; margin-bottom: 16px;
        }

        .ob-select:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
        }

        .ob-select option { background: #0f1428; color: #f8fafc; }

        .ob-grid-2 {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }

        /* Size cards */
        .ob-size-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 8px; margin-bottom: 16px;
        }

        .ob-size-card {
          padding: 12px; text-align: center; cursor: pointer;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .ob-size-card:hover { border-color: rgba(255,255,255,0.18); }

        .ob-size-card.selected {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.08);
        }

        .ob-size-card-title {
          display: block; font-size: 13px; font-weight: 600;
          color: #f8fafc; margin-bottom: 2px;
        }

        .ob-size-card.selected .ob-size-card-title { color: #a5b4fc; }

        .ob-size-card-sub { font-size: 11px; color: #475569; }

        /* Mode toggle */
        .ob-mode-tabs {
          display: flex; gap: 6px; margin-bottom: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 4px;
        }

        .ob-mode-tab {
          flex: 1; padding: 8px; font-size: 13px; font-weight: 500;
          border-radius: 7px; cursor: pointer; transition: all 0.2s;
          text-align: center; background: none; border: none;
          color: #475569; font-family: 'DM Sans', sans-serif;
        }

        .ob-mode-tab.active {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
        }

        /* Search results */
        .ob-search-results {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; overflow: hidden; margin-bottom: 16px;
        }

        .ob-search-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; cursor: pointer;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s; gap: 12px;
        }

        .ob-search-item:last-child { border-bottom: none; }
        .ob-search-item:hover { background: rgba(255,255,255,0.05); }

        .ob-search-item.selected {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.2);
        }

        .ob-search-item-name {
          font-size: 14px; font-weight: 500; color: #e2e8f0;
          margin-bottom: 2px;
        }

        .ob-search-item-meta {
          font-size: 12px; color: #475569; font-weight: 300;
        }

        .ob-domain-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 20px; font-size: 11px;
          font-weight: 500; flex-shrink: 0;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: #34d399;
        }

        /* Info box */
        .ob-info {
          display: flex; gap: 10px; padding: 12px 14px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px; margin-bottom: 20px;
        }

        .ob-info-text {
          font-size: 13px; color: #a5b4fc; line-height: 1.6; font-weight: 300;
        }

        .ob-info-text strong { color: #c7d2fe; font-weight: 500; }

        .ob-warn {
          display: flex; gap: 10px; padding: 12px 14px;
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 10px; margin-bottom: 20px;
        }

        .ob-warn-text {
          font-size: 13px; color: #fcd34d; line-height: 1.6; font-weight: 300;
        }

        /* Buttons */
        .ob-btn-primary {
          width: 100%; padding: 13px; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.25);
        }

        .ob-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.35);
        }

        .ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .ob-btn-ghost {
          width: 100%; padding: 12px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          cursor: pointer; transition: all 0.2s; margin-top: 8px;
          background: rgba(255,255,255,0.04);
          color: #64748b;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .ob-btn-ghost:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }

        /* Success step */
        .ob-success-icon {
          width: 60px; height: 60px; border-radius: 14px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }

        .ob-pending-icon {
          width: 60px; height: 60px; border-radius: 14px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }

        .ob-footer {
          text-align: center; font-size: 12px; color: #1e293b; margin-top: 20px;
        }

        .ob-footer a { color: #334155; text-decoration: none; }

        @media (max-width: 480px) {
          .ob-card { padding: 28px 20px; }
          .ob-size-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ob-root">
        <div className="ob-grid-bg" />
        <div className="ob-glow" />
        <div className="ob-glow-2" />

        <div className="ob-wrap">
          {/* Logo */}
          <a href="/" className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <span className="ob-logo-text">IITBase</span>
          </a>

          {/* Progress */}
          <div className="ob-progress">
            {STEPS.map((s, i) => {
              const status = i < currentStepIdx ? 'done'
                           : i === currentStepIdx ? 'active'
                           : 'pending';
              return (
                <div key={s} className={`ob-progress-item ${status}`}>
                  <div className={`ob-progress-circle ${status}`}>
                    {status === 'done'
                      ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                      : i + 1
                    }
                  </div>
                  <span className={`ob-progress-label ${status}`}>{STEP_LABELS[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Card — re-animates on step change via key */}
          <div className="ob-card" key={step}>
            {error && (
              <div className="ob-error">
                <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                </svg>
                <p className="ob-error-text">{error}</p>
              </div>
            )}

            {/* ── Step 1: Work email ─────────────────────────────────────── */}
            {step === 'WORK_EMAIL' && (
              <>
                <div className="ob-eyebrow">Step 1 of 3</div>
                <h1 className="ob-heading">Verify your work email</h1>
                <p className="ob-sub">
                  Your work email helps us connect you with your company on IITBase automatically.
                  If you don't have one, use your personal email.
                </p>

                <label className="ob-label">Work email address</label>
                <input
                  className="ob-input"
                  type="email"
                  placeholder="you@company.com"
                  value={workForm.workEmail}
                  onChange={e => setWorkForm({ workEmail: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && workForm.workEmail && handleWorkEmailNext()}
                  autoFocus
                />

                {workForm.workEmail && !extractDomain(workForm.workEmail) && (
                  <div className="ob-warn" style={{ marginTop: -8 }}>
                    <svg width="15" height="15" fill="none" stroke="#fcd34d" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4m0 4h.01" />
                    </svg>
                    <p className="ob-warn-text">
                      Personal emails can't be used for auto-verification.
                      You'll need to search for your company manually.
                    </p>
                  </div>
                )}

                <button
                  className="ob-btn-primary"
                  onClick={handleWorkEmailNext}
                  disabled={!workForm.workEmail}
                >
                  Continue →
                </button>
              </>
            )}

            {/* ── Step 2: Company ────────────────────────────────────────── */}
            {step === 'COMPANY' && (
              <>
                <div className="ob-eyebrow">Step 2 of 3</div>
                <h1 className="ob-heading">Your company</h1>
                <p className="ob-sub">
                  Search for your company or create a new one if it's not on IITBase yet.
                </p>

                {/* Mode tabs */}
                <div className="ob-mode-tabs">
                  <button
                    className={`ob-mode-tab${company.mode !== 'create' ? '' : ' active'}`}
                    onClick={() => setCompany(p => ({ ...p, mode: 'create', selectedCompany: null }))}
                  >
                    Create new
                  </button>
                  <button
                    className={`ob-mode-tab${company.mode === 'create' ? '' : ' active'}`}
                    onClick={() => setCompany(p => ({ ...p, mode: 'join', selectedCompany: null }))}
                  >
                    Find existing
                  </button>
                </div>

                {/* Create mode */}
                {company.mode === 'create' && (
                  <>
                    <div className="ob-info">
                      <svg width="15" height="15" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                      </svg>
                      <p className="ob-info-text">
                        Your company will be listed as <strong>unverified</strong> until our team reviews it. You can post jobs immediately — they'll show an unverified badge.
                      </p>
                    </div>

                    <label className="ob-label">Company name *</label>
                    <input
                      className="ob-input"
                      placeholder="e.g. Acme Technologies"
                      value={company.name}
                      onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
                      autoFocus
                    />

                    <div className="ob-grid-2">
                      <div>
                        <label className="ob-label">Industry *</label>
                        <select
                          className="ob-select"
                          value={company.industry}
                          onChange={e => setCompany(p => ({ ...p, industry: e.target.value }))}
                        >
                          <option value="">Select…</option>
                          {INDUSTRIES.map(i => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="ob-label">Website</label>
                        <input
                          className="ob-input"
                          type="url"
                          placeholder="https://"
                          value={company.website}
                          onChange={e => setCompany(p => ({ ...p, website: e.target.value }))}
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                    </div>

                    <label className="ob-label">Company size *</label>
                    <div className="ob-size-grid">
                      {COMPANY_SIZES.map(s => (
                        <button
                          key={s.value}
                          className={`ob-size-card${company.size === s.value ? ' selected' : ''}`}
                          onClick={() => setCompany(p => ({ ...p, size: s.value }))}
                          type="button"
                        >
                          <span className="ob-size-card-title">{s.label}</span>
                          <span className="ob-size-card-sub">{s.sub}</span>
                        </button>
                      ))}
                    </div>

                    <label className="ob-label">About the company</label>
                    <textarea
                      className="ob-textarea"
                      rows={3}
                      placeholder="What does your company do?"
                      value={company.description}
                      onChange={e => setCompany(p => ({ ...p, description: e.target.value }))}
                    />

                    <button
                      className="ob-btn-primary"
                      onClick={handleCompanyNext}
                      disabled={saving || !company.name || !company.industry || !company.size}
                    >
                      {saving ? 'Creating company…' : 'Continue →'}
                    </button>
                  </>
                )}

                {/* Find existing mode */}
                {company.mode !== 'create' && (
                  <>
                    <label className="ob-label">Search company</label>
                    <input
                      className="ob-input"
                      placeholder="Type your company name…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                    />

                    {/* Search results */}
                    {searching && (
                      <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
                        Searching…
                      </p>
                    )}

                    {searchResults.length > 0 && (
                      <div className="ob-search-results">
                        {searchResults.map(result => (
                          <div
                            key={result.id}
                            className={`ob-search-item${company.selectedCompany?.id === result.id ? ' selected' : ''}`}
                            onClick={() => {
                              const mode = result.domainMatch ? 'join' : 'request';
                              setCompany(p => ({ ...p, selectedCompany: result, mode }));
                            }}
                          >
                            <div>
                              <div className="ob-search-item-name">{result.name}</div>
                              <div className="ob-search-item-meta">
                                {result.industry}
                                {result.adminName && ` · Admin: ${result.adminName}${result.adminDesignation ? `, ${result.adminDesignation}` : ''}`}
                              </div>
                            </div>
                            {result.domainMatch && (
                              <span className="ob-domain-badge">
                                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                                Work email match
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Domain match info */}
                    {company.selectedCompany?.domainMatch && (
                      <div className="ob-info">
                        <svg width="15" height="15" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                        </svg>
                        <p className="ob-info-text">
                          Your work email domain matches <strong>{company.selectedCompany.name}</strong>.
                          You'll be added to the team automatically.
                        </p>
                      </div>
                    )}

                    {/* No domain match info */}
                    {company.selectedCompany && !company.selectedCompany.domainMatch && (
                      <div className="ob-warn">
                        <svg width="15" height="15" fill="none" stroke="#fcd34d" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                        </svg>
                        <p className="ob-warn-text">
                          No email domain match. A join request will be sent to{' '}
                          <strong style={{ color: '#fde68a' }}>
                            {company.selectedCompany.adminName ?? 'the company admin'}
                            {company.selectedCompany.adminDesignation
                              ? ` (${company.selectedCompany.adminDesignation})`
                              : ''}
                          </strong>{' '}
                          for approval. You'll be notified by email.
                        </p>
                      </div>
                    )}

                    {/* Optional message for join request */}
                    {company.selectedCompany && !company.selectedCompany.domainMatch && (
                      <>
                        <label className="ob-label">Message to admin (optional)</label>
                        <textarea
                          className="ob-textarea"
                          rows={2}
                          placeholder="e.g. I'm the new Tech Recruiter who joined last month"
                          value={company.joinMessage}
                          onChange={e => setCompany(p => ({ ...p, joinMessage: e.target.value }))}
                        />
                      </>
                    )}

                    <button
                      className="ob-btn-primary"
                      onClick={handleCompanyNext}
                      disabled={saving || !company.selectedCompany}
                    >
                      {saving
                        ? 'Processing…'
                        : company.selectedCompany?.domainMatch
                          ? 'Join company →'
                          : 'Send join request →'
                      }
                    </button>

                    <button
                      className="ob-btn-ghost"
                      onClick={() => setCompany(p => ({ ...p, mode: 'create', selectedCompany: null }))}
                    >
                      My company isn't listed — create it
                    </button>
                  </>
                )}

                <button
                  className="ob-btn-ghost"
                  onClick={() => setStep('WORK_EMAIL')}
                  style={{ marginTop: 8 }}
                >
                  ← Back
                </button>
              </>
            )}

            {/* ── Step 3: Profile ─────────────────────────────────────────── */}
            {step === 'PROFILE' && (
              <>
                <div className="ob-eyebrow">Step 3 of 3</div>
                <h1 className="ob-heading">Your profile</h1>
                <p className="ob-sub">
                  This is shown to IIT candidates on your job listings. Make it clear and professional.
                </p>

                <label className="ob-label">Full name *</label>
                <input
                  className="ob-input"
                  placeholder="e.g. Rahul Sharma"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />

                <label className="ob-label">Designation *</label>
                <input
                  className="ob-input"
                  placeholder="e.g. Technical Recruiter, Head of Talent"
                  value={profile.designation}
                  onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleProfileSubmit()}
                />

                <div className="ob-info">
                  <svg width="15" height="15" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                  </svg>
                  <p className="ob-info-text">
                    You'll be set as the <strong>admin</strong> of your company on IITBase.
                    You can invite teammates from your dashboard.
                  </p>
                </div>

                <button
                  className="ob-btn-primary"
                  onClick={handleProfileSubmit}
                  disabled={saving || !profile.name.trim() || !profile.designation.trim()}
                >
                  {saving ? 'Setting up…' : 'Finish setup →'}
                </button>

                <button
                  className="ob-btn-ghost"
                  onClick={() => setStep('COMPANY')}
                >
                  ← Back
                </button>
              </>
            )}

            {/* ── Step 4: Done ─────────────────────────────────────────────── */}
            {step === 'DONE' && (
              <div style={{ textAlign: 'center' }}>
                {isPending ? (
                  <>
                    <div className="ob-pending-icon">
                      <svg width="26" height="26" fill="none" stroke="#fcd34d" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                      </svg>
                    </div>
                    <h2 className="ob-heading" style={{ textAlign: 'center' }}>
                      Request sent
                    </h2>
                    <p className="ob-sub" style={{ textAlign: 'center' }}>
                      Your request to join <strong style={{ color: '#94a3b8' }}>{company.selectedCompany?.name}</strong> has been sent to the company admin for review. You'll get an email once it's approved.
                    </p>
                    <p style={{ fontSize: 13, color: '#475569', marginBottom: 28 }}>
                      In the meantime, you can browse the platform.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="ob-success-icon">
                      <svg width="26" height="26" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <h2 className="ob-heading" style={{ textAlign: 'center' }}>
                      You're all set
                    </h2>
                    <p className="ob-sub" style={{ textAlign: 'center' }}>
                      Your recruiter profile is live. Start by posting your first job or inviting your team.
                    </p>
                  </>
                )}

                <button
                  className="ob-btn-primary"
                  onClick={() => router.push('/recruiter/dashboard')}
                >
                  Go to dashboard →
                </button>
              </div>
            )}
          </div>

          <p className="ob-footer">
            Need help? <a href="mailto:hello@iitbase.com">hello@iitbase.com</a>
          </p>
        </div>
      </div>
    </>
  );
}