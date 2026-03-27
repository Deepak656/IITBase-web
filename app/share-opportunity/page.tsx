'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { communityJobsApi } from '../../lib/communityJobsApi';
import { PRIMARY_ROLES } from '../../lib/constants';
import ProtectedRoute from '../../components/ProtectedRoute';

const JOB_DOMAINS = [
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'ANALYTICS', label: 'Analytics' },
  { value: 'CONSULTING', label: 'Consulting' },
] as const;

type JobDomain = (typeof JOB_DOMAINS)[number]['value'];
const TECH_ROLE = [
  { value: 'ENGINEERING_MANAGER', label: 'Engineering Manager' },
  { value: 'EMBEDDED_ENGINEER', label: 'Embedded Engineer' },
  { value: 'SECURITY_ENGINEER', label: 'Security Engineer' },
  { value: 'SOLUTIONS_ARCHITECT', label: 'Solutions Architect' },
  { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
  { value: 'FULL_STACK_ENGINEER', label: 'Full Stack Engineer' },
  { value: 'BACKEND_ENGINEER', label: 'Backend Engineer' },
  { value: 'PLATFORM_ENGINEER', label: 'Platform Engineer' },
  { value: 'FRONTEND_ENGINEER', label: 'Frontend Engineer' },
  { value: 'QA_ENGINEER', label: 'QA Engineer' },
  { value: 'SITE_RELIABILITY_ENGINEER', label: 'Site Reliability Engineer' },
  { value: 'OTHER', label: 'Other' },
] as const;

type TechRole =(typeof TECH_ROLE)[number]['value'];

interface FormData {
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  sourceUrl: string;
  jobDescription: string;
  minExperience: string;
  maxExperience: string;
  jobDomain: JobDomain;
  techRole: string;
  roleTitle: string;
  techStack: string;
  skills: string;
  tierOneReason: string;
}

interface FormErrors {
  title?: string;
  company?: string;
  location?: string;
  applyUrl?: string;
  jobDescription?: string;
  minExperience?: string;
  maxExperience?: string;
  experience?: string;
  jobDomain?: string;
  techRole?: string;
  roleTitle?: string;
  tierOneReason?: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  company: '',
  location: '',
  applyUrl: '',
  sourceUrl: '',
  jobDescription: '',
  minExperience: '',
  maxExperience: '',
  jobDomain: 'TECHNOLOGY',
  techRole: 'SOFTWARE_ENGINEER',
  roleTitle: '',
  techStack: '',
  skills: '',
  tierOneReason: '',
};

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.title.trim()) errors.title = 'Job title is required';
  else if (data.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

  if (!data.company.trim()) errors.company = 'Company name is required';

  if (!data.location.trim()) errors.location = 'Location is required';

  if (!data.applyUrl.trim()) {
    errors.applyUrl = 'Application URL is required';
  } else {
    try {
      new URL(data.applyUrl);
    } catch {
      errors.applyUrl = 'Enter a valid URL (e.g. https://company.com/apply)';
    }
  }

  if (data.minExperience === '') {
    errors.minExperience = 'Required';
  } else if (parseInt(data.minExperience) < 0) {
    errors.minExperience = 'Cannot be negative';
  }

  if (data.maxExperience === '') {
    errors.maxExperience = 'Required';
  } else if (parseInt(data.maxExperience) < 0) {
    errors.maxExperience = 'Cannot be negative';
  }

  if (
    data.minExperience !== '' &&
    data.maxExperience !== '' &&
    parseInt(data.minExperience) > parseInt(data.maxExperience)
  ) {
    errors.experience = 'Min experience cannot be greater than max';
  }

  if (!data.roleTitle.trim()) errors.roleTitle = 'Role title is required';

  if (data.jobDomain === 'TECHNOLOGY' && !data.techRole) {
    errors.techRole = 'Tech role is required for Technology domain';
  }

  if (!data.tierOneReason.trim()) {
    errors.tierOneReason = 'This field is required';
  } else if (data.tierOneReason.trim().length < 20) {
    errors.tierOneReason = 'Please provide more detail (at least 20 characters)';
  }

  return errors;
}

// ── Small UI helpers ──────────────────────────────────────────────────────────

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-1">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}

const inputBase =
  'w-full px-4 py-2.5 text-sm border rounded-md bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed';
const inputOk = 'border-gray-300';
const inputErr = 'border-red-400 focus:ring-red-400';

// ── Main form ─────────────────────────────────────────────────────────────────

function SubmitJobForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const set = (field: keyof FormData, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    // Re-validate only the fields the user has already touched
    if (touched[field]) {
      const e = validate(next);
      setErrors((prev) => ({ ...prev, [field]: e[field as keyof FormErrors] }));
    }
  };

  const blur = (field: keyof FormData) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const e = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: e[field as keyof FormErrors] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const e2 = validate(formData);
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      // Mark everything as touched so all errors show
      const allTouched = Object.keys(formData).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {} as Record<string, boolean>
      );
      setTouched(allTouched);
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-field-error]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      await communityJobsApi.jobs.submit({
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        applyUrl: formData.applyUrl.trim(),
        sourceUrl: formData.sourceUrl.trim() || undefined,
        jobDescription: formData.jobDescription.trim() || undefined,
        minExperience: parseInt(formData.minExperience),
        maxExperience: parseInt(formData.maxExperience),
        jobDomain: formData.jobDomain,
        techRole: formData.jobDomain === 'TECHNOLOGY' ? formData.techRole : undefined,
        roleTitle: formData.roleTitle.trim() || formData.title.trim(),
        techStack: formData.techStack.split(',').map((s) => s.trim()).filter(Boolean),
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        tierOneReason: formData.tierOneReason.trim(),
      });

      router.push('/jobs?submitted=1');
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isTech = formData.jobDomain === 'TECHNOLOGY';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">
            Community
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Share an Opportunity</h1>
          <p className="text-sm text-gray-500">
            All submissions go through a manual review. Good listings get approved within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-16">
        {/* Global submit error */}
        {submitError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-8">

          {/* ── Section: Basic Info ─────────────────────────────────────── */}
          <Section title="Basic Information">
            {/* Title */}
            <Field>
              <Label htmlFor="title" required>Job Title</Label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => set('title', e.target.value)}
                onBlur={() => blur('title')}
                placeholder="e.g., Senior Backend Engineer"
                className={`${inputBase} ${errors.title ? inputErr : inputOk}`}
              />
              <FieldError message={errors.title} />
            </Field>

            {/* Company + Location */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="company" required>Company</Label>
                <input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => set('company', e.target.value)}
                  onBlur={() => blur('company')}
                  placeholder="e.g., Stripe"
                  className={`${inputBase} ${errors.company ? inputErr : inputOk}`}
                />
                <FieldError message={errors.company} />
              </Field>

              <Field>
                <Label htmlFor="location" required>Location</Label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => set('location', e.target.value)}
                  onBlur={() => blur('location')}
                  placeholder="e.g., Bangalore / Remote"
                  className={`${inputBase} ${errors.location ? inputErr : inputOk}`}
                />
                <FieldError message={errors.location} />
              </Field>
            </div>

            {/* Apply URL */}
            <Field>
              <Label htmlFor="applyUrl" required>Application URL</Label>
              <input
                id="applyUrl"
                type="url"
                value={formData.applyUrl}
                onChange={(e) => set('applyUrl', e.target.value)}
                onBlur={() => blur('applyUrl')}
                placeholder="https://company.com/careers/job-id"
                className={`${inputBase} ${errors.applyUrl ? inputErr : inputOk}`}
              />
              <FieldError message={errors.applyUrl} />
              {!errors.applyUrl && <Hint>Direct link where candidates apply</Hint>}
            </Field>

            {/* Source URL */}
            <Field>
              <Label htmlFor="sourceUrl">Source URL</Label>
              <input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => set('sourceUrl', e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className={`${inputBase} ${inputOk}`}
              />
              <Hint>Where you found this — LinkedIn, company site, etc. (optional)</Hint>
            </Field>
          </Section>

          {/* ── Section: Role Classification ────────────────────────────── */}
          <Section title="Role Classification">
            {/* Role Title */}
            <Field>
              <Label htmlFor="roleTitle" required>Role Title</Label>
              <input
                id="roleTitle"
                type="text"
                value={formData.roleTitle}
                onChange={(e) => set('roleTitle', e.target.value)}
                onBlur={() => blur('roleTitle')}
                placeholder="e.g., Backend Engineer, Staff SWE"
                className={`${inputBase} ${errors.roleTitle ? inputErr : inputOk}`}
              />
              <FieldError message={errors.roleTitle} />
              {!errors.roleTitle && (
                <Hint>Display-friendly title shown on the listing</Hint>
              )}
            </Field>

            {/* Domain + Tech Role */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="jobDomain" required>Domain</Label>
                <select
                  id="jobDomain"
                  value={formData.jobDomain}
                  onChange={(e) => set('jobDomain', e.target.value as JobDomain)}
                  className={`${inputBase} ${inputOk}`}
                >
                  {JOB_DOMAINS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>

              {isTech && (
                <Field>
                  <Label htmlFor="techRole" required>Tech Role</Label>
                  <select
                    id="techRole"
                    value={formData.techRole}
                    onChange={(e) => set('techRole', e.target.value)}
                    onBlur={() => blur('techRole')}
                    className={`${inputBase} ${errors.techRole ? inputErr : inputOk}`}
                  >
                    {PRIMARY_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.techRole} />
                </Field>
              )}
            </div>

            {/* Experience */}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1.5">
                Experience Range (years)<span className="text-red-500 ml-0.5">*</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field>
                  <input
                    id="minExperience"
                    type="number"
                    min={0}
                    max={30}
                    value={formData.minExperience}
                    onChange={(e) => set('minExperience', e.target.value)}
                    onBlur={() => blur('minExperience')}
                    placeholder="Min (e.g. 2)"
                    className={`${inputBase} ${errors.minExperience || errors.experience ? inputErr : inputOk}`}
                  />
                  <FieldError message={errors.minExperience} />
                </Field>

                <Field>
                  <input
                    id="maxExperience"
                    type="number"
                    min={0}
                    max={30}
                    value={formData.maxExperience}
                    onChange={(e) => set('maxExperience', e.target.value)}
                    onBlur={() => blur('maxExperience')}
                    placeholder="Max (e.g. 5)"
                    className={`${inputBase} ${errors.maxExperience || errors.experience ? inputErr : inputOk}`}
                  />
                  <FieldError message={errors.maxExperience} />
                </Field>
              </div>
              {errors.experience && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1" data-field-error>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.experience}
                </p>
              )}
            </div>
          </Section>

          {/* ── Section: Details ─────────────────────────────────────────── */}
          <Section title="Job Details">
            {/* Description */}
            <Field>
              <Label htmlFor="jobDescription">Job Description</Label>
              <textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => set('jobDescription', e.target.value)}
                rows={5}
                placeholder="Paste a brief description of the role, responsibilities, and requirements..."
                className={`${inputBase} resize-none`}
              />
              <Hint>Optional — helps reviewers understand the role better</Hint>
            </Field>

            {/* Tech Stack */}
            <Field>
              <Label htmlFor="techStack">Tech Stack</Label>
              <input
                id="techStack"
                type="text"
                value={formData.techStack}
                onChange={(e) => set('techStack', e.target.value)}
                placeholder="Java, Spring Boot, PostgreSQL, Kafka, AWS"
                className={`${inputBase} ${inputOk}`}
              />
              <Hint>Comma-separated — leave blank if not applicable</Hint>
            </Field>

            {/* Skills */}
            <Field>
              <Label htmlFor="skills">Required Skills</Label>
              <input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e) => set('skills', e.target.value)}
                placeholder="System Design, REST APIs, Microservices, Low-latency"
                className={`${inputBase} ${inputOk}`}
              />
              <Hint>Comma-separated</Hint>
            </Field>
          </Section>

          {/* ── Section: Tier-1 Justification ────────────────────────────── */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 space-y-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Why is this a Tier-1 opportunity?
                <span className="text-red-500 ml-0.5">*</span>
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Explain why this role suits IIT / top-tier graduates specifically — e.g., explicit
                preference in JD, strong systems design bar, compensation in top percentile, etc.
              </p>
            </div>
            <textarea
              id="tierOneReason"
              value={formData.tierOneReason}
              onChange={(e) => set('tierOneReason', e.target.value)}
              onBlur={() => blur('tierOneReason')}
              required
              rows={3}
              placeholder="e.g., JD explicitly mentions IIT preference and requires deep distributed systems experience..."
              className={`w-full px-4 py-2.5 text-sm border rounded-md bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.tierOneReason ? 'border-red-400' : 'border-blue-200'
              }`}
            />
            <FieldError message={errors.tierOneReason} />
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting…
                </span>
              ) : (
                'Submit for Review'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center -mt-4">
            Reviewed within 24–48 hours. You'll be notified on approval or rejection.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{title}</h2>
      {children}
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div data-field-error>{children}</div>;
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function SubmitJobPage() {
  return (
    <ProtectedRoute>
      <SubmitJobForm />
    </ProtectedRoute>
  );
}