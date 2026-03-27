import { getToken, removeToken } from './auth';
import type { Job } from '../types/job';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.iitbase.com';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: number;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error('Session expired. Please login again.');
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = await response.json();
  } catch { /* no body */ }

  if (!response.ok) throw new Error(body?.message || `Request failed (${response.status})`);
  if (!body?.success) throw new Error(body?.message || 'Request failed');

  return body.data;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompanySize = 'STARTUP' | 'SME' | 'ENTERPRISE';
export type CompanyStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AdminStats {
  users: {
    total: number;
    jobSeekers: number;
    recruiters: number;
    admins: number;
  };
  companies: {
    total: number;
    verified: number;
    pending: number;
  };
  jobs: {
    community: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      underReview: number;
      expired: number;
    };
    recruiter: {
      total: number;
      active: number;
      closed: number;
      removed: number;
    };
  };
  applications: {
    total: number;
    invitesSent: number;
  };
}

export interface AdminCompanyResponse {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  logoUrl?: string;
  description?: string;
  isVerified: boolean;
  status?: CompanyStatus;
  createdAt: string;
  recruiterCount: number;
}

export interface AdminRecruiterResponse {
  id: number;
  userId: number;
  userEmail: string;
  companyId: number;
  companyName: string;
  companyVerified: boolean;
  designation?: string;
  isAdmin: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export interface AdminUserResponse {
  email: string;
  role: string;
  activeSessions: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const adminApi = {

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    get: () =>
      fetchApi<AdminStats>('/api/admin/stats'),
  },

  // ── Jobs ───────────────────────────────────────────────────────────────────
  jobs: {
    getPending: () =>
      fetchApi<Job[]>('/api/admin/jobs/pending'),
    getReported: () =>
      fetchApi<Job[]>('/api/admin/jobs/reported'),
    approve: (id: number) =>
      fetchApi<void>(`/api/admin/jobs/${id}/approve`, { method: 'POST' }),
    reject: (id: number) =>
      fetchApi<void>(`/api/admin/jobs/${id}/reject`, { method: 'POST' }),
    markExpired: (id: number) =>
      fetchApi<void>(`/api/admin/jobs/${id}/mark-expired`, { method: 'POST' }),
  },

  // ── Companies ──────────────────────────────────────────────────────────────
  companies: {
    getAll: (page = 0, size = 20, search?: string, verified?: boolean) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (search) params.set('search', search);
      if (verified !== undefined) params.set('verified', String(verified));
      return fetchApi<PageResponse<AdminCompanyResponse>>(
        `/api/admin/companies?${params}`
      );
    },
    getOne: (id: number) =>
      fetchApi<AdminCompanyResponse>(`/api/admin/companies/${id}`),
    verify: (id: number) =>
      fetchApi<AdminCompanyResponse>(`/api/admin/companies/${id}/verify`, { method: 'POST' }),
    unverify: (id: number) =>
      fetchApi<AdminCompanyResponse>(`/api/admin/companies/${id}/unverify`, { method: 'POST' }),
    edit: (id: number, body: Partial<{
      name: string; website: string; industry: string;
      size: CompanySize; description: string; logoUrl: string;
    }>) =>
      fetchApi<AdminCompanyResponse>(`/api/admin/companies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },

  // ── Recruiters ─────────────────────────────────────────────────────────────
  recruiters: {
    getAll: (page = 0, size = 20) =>
      fetchApi<PageResponse<AdminRecruiterResponse>>(
        `/api/admin/recruiters?page=${page}&size=${size}`
      ),
    getByCompany: (companyId: number, page = 0, size = 20) =>
      fetchApi<PageResponse<AdminRecruiterResponse>>(
        `/api/admin/recruiters/company/${companyId}?page=${page}&size=${size}`
      ),
    getOne: (id: number) =>
      fetchApi<AdminRecruiterResponse>(`/api/admin/recruiters/${id}`),
    suspend: (id: number) =>
      fetchApi<AdminRecruiterResponse>(`/api/admin/recruiters/${id}/suspend`, { method: 'POST' }),
    unsuspend: (id: number) =>
      fetchApi<AdminRecruiterResponse>(`/api/admin/recruiters/${id}/unsuspend`, { method: 'POST' }),
  },
  //-- Jobseekers----------------
    jobseekers: {
    getAll: (page = 0, size = 20, search?: string, verified?: boolean) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (search)              params.set('search',   search);
      if (verified !== undefined) params.set('verified', String(verified));
      return fetchApi<PageResponse<AdminJobseekerResponse>>(
        `/api/admin/jobseekers?${params}`
      );
    },
    getOne: (id: number) =>
      fetchApi<AdminJobseekerResponse>(`/api/admin/jobseekers/${id}`),
    verify: (id: number) =>
      fetchApi<AdminJobseekerResponse>(`/api/admin/jobseekers/${id}/verify`, {
        method: 'POST',
      }),
    unverify: (id: number) =>
      fetchApi<AdminJobseekerResponse>(`/api/admin/jobseekers/${id}/unverify`, {
        method: 'POST',
      }),
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  users: {
    getAll: (page = 0, size = 20) =>
      fetchApi<PageResponse<AdminUserResponse>>(
        `/api/admin/users?page=${page}&size=${size}`
      ),
    getByRole: (role: string) =>
      fetchApi<AdminUserResponse[]>(`/api/admin/users/role/${role}`),
    getOne: (email: string) =>
      fetchApi<AdminUserResponse>(`/api/admin/users/${encodeURIComponent(email)}`),
    forceLogout: (email: string) =>
      fetchApi<void>(`/api/admin/users/${encodeURIComponent(email)}/force-logout`, { method: 'POST' }),
    delete: (email: string) =>
      fetchApi<void>(`/api/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  reports: {
    getAll: (page = 0, size = 20, status?: string) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return fetchApi<PageResponse<any>>(`/api/admin/reports?${params}`);
    },
    resolve: (id: number, resolution: string) =>
      fetchApi<any>(`/api/admin/reports/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution }),
      }),
    dismiss: (id: number) =>
      fetchApi<any>(`/api/admin/reports/${id}/dismiss`, { method: 'POST' }),
  },
  // -----details ----------------
    detail: {
    communityJob: (id: number) =>
      fetchApi<CommunityJobDetailResponse>(`/api/admin/detail/community-job/${id}`),
    recruiterJob: (id: number) =>
      fetchApi<RecruiterJobDetailResponse>(`/api/admin/detail/recruiter-job/${id}`),
    company: (id: number) =>
      fetchApi<AdminCompanyDetailResponse>(`/api/admin/detail/company/${id}`),
    recruiter: (id: number) =>
      fetchApi<AdminRecruiterDetailResponse>(`/api/admin/detail/recruiter/${id}`),
    jobseeker: (id: number) =>
      fetchApi<AdminJobseekerDetailResponse>(`/api/admin/detail/jobseeker/${id}`),
  },

  // ── Removals ───────────────────────────────────────────────────────────────
  removals: {
    getAll: (page = 0, size = 20, status?: string) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return fetchApi<PageResponse<any>>(`/api/admin/removals?${params}`);
    },
    approve: (id: number) =>
      fetchApi<any>(`/api/admin/removals/${id}/approve`, { method: 'POST' }),
    deny: (id: number) =>
      fetchApi<any>(`/api/admin/removals/${id}/deny`, { method: 'POST' }),
  },
  staff: {
    sendInvite: (email: string) =>
      fetchApi<StaffInviteResponse>('/api/admin/staff/invite', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    listInvites: (page = 0, size = 20) =>
      fetchApi<PageResponse<StaffInviteResponse>>(
        `/api/admin/staff/invites?page=${page}&size=${size}`
      ),

    revokeInvite: (id: number) =>
      fetchApi<StaffInviteResponse>(`/api/admin/staff/invites/${id}`, {
        method: 'DELETE',
      }),

    validateToken: (token: string) =>
      fetchApi<StaffInviteResponse>(
        `/api/admin/staff/invite/validate?token=${encodeURIComponent(token)}`
      ),

    acceptInvite: (body: AcceptStaffInviteRequest) =>
      fetchApi<{ token: string; role: string }>('/api/admin/staff/invite/accept', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
};

// Legacy export so existing imports don't break
export const admin = adminApi.jobs;

export type StaffInviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
 
export interface StaffInviteResponse {
  id:             number;
  email:          string;
  invitedByEmail: string;
  status:         StaffInviteStatus;
  expiresAt:      string;
  acceptedAt?:    string;
  createdAt:      string;
}
 
export interface AcceptStaffInviteRequest {
  token:      string;
  password?:  string;
}

export interface AdminJobseekerResponse {
  id:                number;
  userId:            number;
  email:             string;
  fullName?:         string;
  headline?:         string;
  phone?:            string;
  profilePhotoUrl?:  string;
  resumeUrl?:        string;
  linkedinUrl?:      string;
  profileCompletion: number;
  isVerified:        boolean;
  verifiedAt?:       string;
  createdAt:         string;
}

export interface CommunityJobDetailResponse {
  id: number;
  title: string;
  company: string;
  location?: string;
  jobDescription?: string;
  applyUrl?: string;
  sourceUrl?: string;
  minExperience: number;
  maxExperience: number;
  jobDomain: string;
  techRole?: string;
  roleTitle: string;
  tierOneReason?: string;
  status: string;
  techStack: string[];
  skills: string[];
  createdAt: string;
  poster?: {
    userId: number;
    email: string;
    role: string;
    fullName?: string;
    phone?: string;
    headline?: string;
    linkedinUrl?: string;
    profileCompletion?: number;
    isVerified?: boolean;
  };
}
 
export interface RecruiterJobDetailResponse {
  id: number;
  title: string;
  roleTitle: string;
  jobDomain: string;
  techRole?: string;
  location?: string;
  jobDescription?: string;
  minExperience: number;
  maxExperience: number;
  applyType: string;
  applyUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: string;
  techStack: string[];
  skills: string[];
  createdAt: string;
  expiresAt?: string;
  recruiter?: {
    id: number;
    userId: number;
    email: string;
    name?: string;
    designation?: string;
    workEmail?: string;
    phone?: string;
    role: string;
  };
  company?: {
    id: number;
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    isVerified: boolean;
    status: string;
    emailDomain?: string;
  };
}
 
export interface AdminCompanyDetailResponse {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  logoUrl?: string;
  description?: string;
  isVerified: boolean;
  status: string;
  emailDomain?: string;
  createdAt: string;
  createdBy?: {
    userId: number;
    email: string;
    name?: string;
    designation?: string;
    workEmail?: string;
    phone?: string;
  };
  recruiters: Array<{
    id: number;
    email: string;
    name?: string;
    designation?: string;
    workEmail?: string;
    phone?: string;
    role: string;
  }>;
}
 
export interface AdminRecruiterDetailResponse {
  id: number;
  userId: number;
  email: string;
  name?: string;
  designation?: string;
  role: string;
  workEmail?: string;
  phone?: string;
  isSuspended: boolean;
  createdAt: string;
  company?: {
    id: number;
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    isVerified: boolean;
    status: string;
    emailDomain?: string;
    createdAt: string;
  };
  jobs: Array<{
    id: number;
    title: string;
    roleTitle: string;
    status: string;
    applyType: string;
    createdAt: string;
  }>;
}
 
export interface AdminJobseekerDetailResponse {
  id: number;
  userId: number;
  email: string;
  fullName?: string;
  phone?: string;
  headline?: string;
  summary?: string;
  profilePhotoUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  isOnCareerBreak?: boolean;
  profileCompletion: number;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}