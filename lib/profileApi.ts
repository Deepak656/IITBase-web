import type {
  BasicInfoRequest,
  CertificationDTO,
  EducationDTO,
  JobPreferenceDTO,
  JobseekerProfileDTO,
  ProjectDTO,
  SkillDTO,
  WorkExperienceDTO,
} from '../app/profile/types/profile';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'httpa:/api.iitbase.com';

// All endpoints return ApiResponse<T> = { success, message, data }
// Controllers confirmed: even DELETE returns ApiResponse<Void> with data: null
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const body = await res.json();
  // ApiResponse<T> wrapper: unwrap .data, fall back to body itself for
  // endpoints that might return the object directly.
  return body.data ?? body;
}

async function upload<T>(path: string, file: File): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const body = await res.json();
  return body.data ?? body;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileApi = {
  /** GET /api/v1/profile — full profile with all nested sections */
  get: () => request<JobseekerProfileDTO>('/api/v1/profile'),

  /** Alias used by useProfile hook */
  getFullProfile: () => request<JobseekerProfileDTO>('/api/v1/profile'),

  /** PUT /api/v1/profile/basic */
  updateBasic: (data: BasicInfoRequest) =>
    request<JobseekerProfileDTO>('/api/v1/profile/basic', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Alias used by BasicInfoForm */
  updateBasicInfo: (data: BasicInfoRequest) =>
    request<JobseekerProfileDTO>('/api/v1/profile/basic', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** POST /api/v1/profile/resume — multipart, replaces existing */
  uploadResume: (file: File) => upload<string>('/api/v1/profile/resume', file),

  /** POST /api/v1/profile/photo — multipart, replaces existing */
  uploadPhoto: (file: File) => upload<string>('/api/v1/profile/photo', file),
};

// ─── Work Experience ──────────────────────────────────────────────────────────

export const experienceApi = {
  getAll: () => request<WorkExperienceDTO[]>('/api/v1/profile/experience'),

  add: (data: WorkExperienceDTO) =>
    request<WorkExperienceDTO>('/api/v1/profile/experience', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: WorkExperienceDTO) =>
    request<WorkExperienceDTO>(`/api/v1/profile/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE returns ApiResponse<Void> { data: null } — not a 204
  delete: (id: number) =>
    request<null>(`/api/v1/profile/experience/${id}`, { method: 'DELETE' }),
};

// ─── Education ────────────────────────────────────────────────────────────────

export const educationApi = {
  getAll: () => request<EducationDTO[]>('/api/v1/profile/education'),

  add: (data: EducationDTO) =>
    request<EducationDTO>('/api/v1/profile/education', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: EducationDTO) =>
    request<EducationDTO>(`/api/v1/profile/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<null>(`/api/v1/profile/education/${id}`, { method: 'DELETE' }),
};

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillsApi = {
  getAll: () => request<SkillDTO[]>('/api/v1/profile/skills'),

  add: (data: SkillDTO) =>
    request<SkillDTO>('/api/v1/profile/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: SkillDTO) =>
    request<SkillDTO>(`/api/v1/profile/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<null>(`/api/v1/profile/skills/${id}`, { method: 'DELETE' }),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  getAll: () => request<ProjectDTO[]>('/api/v1/profile/projects'),

  add: (data: ProjectDTO) =>
    request<ProjectDTO>('/api/v1/profile/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProjectDTO) =>
    request<ProjectDTO>(`/api/v1/profile/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<null>(`/api/v1/profile/projects/${id}`, { method: 'DELETE' }),
};

// ─── Certifications ───────────────────────────────────────────────────────────

export const certificationsApi = {
  getAll: () => request<CertificationDTO[]>('/api/v1/profile/certifications'),

  add: (data: CertificationDTO) =>
    request<CertificationDTO>('/api/v1/profile/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CertificationDTO) =>
    request<CertificationDTO>(`/api/v1/profile/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<null>(`/api/v1/profile/certifications/${id}`, { method: 'DELETE' }),
};

// ─── Job Preferences ──────────────────────────────────────────────────────────
// Both POST and PUT call saveOrUpdateJobPreference on the backend — they are
// functionally identical. We always use POST to keep it simple.

export const preferencesApi = {
  /** GET /api/v1/profile/job-preferences */
  get: () => request<JobPreferenceDTO>('/api/v1/profile/job-preferences'),

  /** POST /api/v1/profile/job-preferences — creates or updates */
  save: (data: JobPreferenceDTO) =>
    request<JobPreferenceDTO>('/api/v1/profile/job-preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** PUT /api/v1/profile/job-preferences — also creates or updates (same service call) */
  update: (data: JobPreferenceDTO) =>
    request<JobPreferenceDTO>('/api/v1/profile/job-preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** DELETE /api/v1/profile/job-preferences */
  delete: () =>
    request<null>('/api/v1/profile/job-preferences', { method: 'DELETE' }),
};

// Backward-compat alias used in JobPreferencesSection.tsx
export const jobPreferenceApi = preferencesApi;