// lib/recruiterApi.ts

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.iitbase.com';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') ?? sessionStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error('Session expired. Please login again.');
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Request failed');
  return json.data as T;
}

// ── Company ───────────────────────────────────────────────────────────────────
export const companyApi = {
  create: (body: CreateCompanyRequest) =>
    request<CompanyResponse>('/api/v1/companies', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  get: (id: number) =>
    request<CompanyResponse>(`/api/v1/companies/${id}`),

  update: (id: number, body: Partial<CreateCompanyRequest> & { logoUrl?: string }) =>
    request<CompanyResponse>(`/api/v1/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // Onboarding — search existing companies by name
  // Pass domain (e.g. "google.com") to get domainMatch flags back
  search: (q: string, domain?: string, page = 0, size = 10) => {
    const params = new URLSearchParams({ q, page: String(page), size: String(size) });
    if (domain) params.set('domain', domain);
    return request<CompanySearchResult[]>(`/api/v1/companies/search?${params}`);
  },

  // Path B: request to join an existing company
  requestToJoin: (companyId: number, body: JoinCompanyRequest) =>
    request<JoinRequestResponse>(`/api/v1/companies/${companyId}/join-request`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Accept a team invite (called after signup)
  acceptInvite: (body: AcceptInviteRequest) =>
    request<RecruiterProfileResponse>('/api/v1/companies/invite/accept', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // IITBase admin
  getPending: (page = 0, size = 20) =>
    request<PaginatedResponse<CompanyResponse>>(
      `/api/v1/companies/pending?page=${page}&size=${size}`
    ),

  verify: (id: number) =>
    request<CompanyResponse>(`/api/v1/companies/${id}/verify`, { method: 'PATCH' }),

  reject: (id: number) =>
    request<CompanyResponse>(`/api/v1/companies/${id}/reject`, { method: 'PATCH' }),
};

// ── Recruiter Profile ─────────────────────────────────────────────────────────
export const recruiterApi = {
  createProfile: (body: { companyId: number; name: string; designation: string }) =>
    request<RecruiterProfileResponse>('/api/v1/recruiters/profile', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyProfile: () =>
    request<RecruiterProfileResponse>('/api/v1/recruiters/profile/me'),

  updateMyProfile: (body: { name?: string; designation?: string }) =>
    request<RecruiterProfileResponse>('/api/v1/recruiters/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  getPublicProfile: (id: number) =>
    request<RecruiterProfileResponse>(`/api/v1/recruiters/${id}`),
};

// ── Team Management ───────────────────────────────────────────────────────────
export const teamApi = {
  // Get all members of my company
  getMembers: () =>
    request<TeamMemberResponse[]>('/api/v1/recruiter/team'),

  // Promote or demote a member
  updateRole: (recruiterId: number, role: TeamMemberRole) =>
    request<TeamMemberResponse>(`/api/v1/recruiter/team/${recruiterId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  // Remove a member from the team
  removeMember: (recruiterId: number) =>
    request<void>(`/api/v1/recruiter/team/${recruiterId}`, { method: 'DELETE' }),

  // Send invite by email
  invite: (body: InviteTeamMemberRequest) =>
    request<RecruiterInviteResponse>('/api/v1/recruiter/team/invites', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // List pending invites
  getPendingInvites: (page = 0, size = 20) =>
    request<PaginatedResponse<RecruiterInviteResponse>>(
      `/api/v1/recruiter/team/invites?page=${page}&size=${size}`
    ),

  // Revoke a pending invite
  revokeInvite: (inviteId: number) =>
    request<void>(`/api/v1/recruiter/team/invites/${inviteId}`, { method: 'DELETE' }),

  // List pending join requests
  getJoinRequests: (page = 0, size = 20) =>
    request<PaginatedResponse<JoinRequestResponse>>(
      `/api/v1/recruiter/team/join-requests?page=${page}&size=${size}`
    ),

  // Approve a join request
  approveJoinRequest: (requestId: number, name?: string, designation?: string) => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (designation) params.set('designation', designation);
    return request<JoinRequestResponse>(
      `/api/v1/recruiter/team/join-requests/${requestId}/approve?${params}`,
      { method: 'POST' }
    );
  },

  // Reject a join request
  rejectJoinRequest: (requestId: number, rejectionReason?: string) =>
    request<JoinRequestResponse>(
      `/api/v1/recruiter/team/join-requests/${requestId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ rejectionReason }),
      }
    ),
};

// ── Recruiter Jobs ────────────────────────────────────────────────────────────
export const recruiterJobApi = {
  post: (body: PostJobRequest) =>
    request<RecruiterJobResponse>('/api/v1/recruiter/jobs', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyListings: (page = 0, size = 20) =>
    request<PaginatedResponse<RecruiterJobResponse>>(
      `/api/v1/recruiter/jobs/my-listings?page=${page}&size=${size}`
    ),

  getById: (id: number) =>
    request<RecruiterJobResponse>(`/api/v1/recruiter/jobs/${id}`),

  update: (id: number, body: Partial<PostJobRequest>) =>
    request<RecruiterJobResponse>(`/api/v1/recruiter/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  updateStatus: (id: number, status: RecruiterJobStatus) =>
    request<RecruiterJobResponse>(`/api/v1/recruiter/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  remove: (id: number) =>
    request<void>(`/api/v1/recruiter/jobs/${id}`, { method: 'DELETE' }),
};

// ── Job Feed ──────────────────────────────────────────────────────────────────
export const feedApi = {
  get: (params: FeedFilterParams) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      if (Array.isArray(v)) v.forEach(i => q.append(k, i));
      else q.set(k, String(v));
    });
    return request<PaginatedResponse<JobFeedItem>>(`/api/public/feed?${q}`);
  },
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationApi = {
  apply: (body: { recruiterJobId: number; coverNote?: string }) =>
    request<ApplicationResponse>('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyApplications: (page = 0, size = 20) =>
    request<PaginatedResponse<ApplicationResponse>>(
      `/api/v1/applications/my?page=${page}&size=${size}`
    ),

  getMyApplicationDetail: (id: number) =>
    request<{ application: ApplicationResponse; history: StatusHistoryItem[] }>(
      `/api/v1/applications/my/${id}`
    ),

  withdraw: (id: number) =>
    request<ApplicationResponse>(`/api/v1/applications/my/${id}/withdraw`, {
      method: 'PATCH',
    }),

  getApplicants: (jobId: number, page = 0, size = 20) =>
    request<PaginatedResponse<ApplicationDetailResponse>>(
      `/api/v1/recruiter/applications/jobs/${jobId}?page=${page}&size=${size}`
    ),

  getApplicationDetail: (id: number) =>
    request<{ application: ApplicationDetailResponse; history: StatusHistoryItem[] }>(
      `/api/v1/recruiter/applications/${id}`
    ),

  updateStatus: (id: number, body: { status: string; note?: string }) =>
    request<ApplicationDetailResponse>(
      `/api/v1/recruiter/applications/${id}/status`,
      { method: 'PATCH', body: JSON.stringify(body) }
    ),

  updateNotes: (id: number, notes: string) =>
    request<ApplicationDetailResponse>(
      `/api/v1/recruiter/applications/${id}/notes`,
      { method: 'PATCH', body: JSON.stringify({ notes }) }
    ),
};

// ── Invites ───────────────────────────────────────────────────────────────────
export const inviteApi = {
  send: (body: { jobseekerId: number; recruiterJobId: number; message?: string }) =>
    request<JobInviteResponse>('/api/v1/invites', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyInvites: (page = 0, size = 20) =>
    request<PaginatedResponse<JobInviteResponse>>(
      `/api/v1/invites/my?page=${page}&size=${size}`
    ),

  decline: (id: number) =>
    request<JobInviteResponse>(`/api/v1/invites/my/${id}/decline`, {
      method: 'PATCH',
    }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: (page = 0, size = 20) =>
    request<PaginatedResponse<NotificationItem>>(
      `/api/v1/notifications?page=${page}&size=${size}`
    ),

  getUnreadCount: () =>
    request<{ unreadCount: number }>('/api/v1/notifications/unread-count'),

  markOneRead: (id: number) =>
    request<void>(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request<void>('/api/v1/notifications/read-all', { method: 'PATCH' }),
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompanySize       = 'STARTUP' | 'SME' | 'ENTERPRISE';
export type CompanyStatus     = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type TeamMemberRole    = 'ADMIN' | 'MEMBER';
export type InviteStatusTeam  = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type JobDomain =
  | 'TECHNOLOGY' | 'ANALYTICS' | 'CORE_ENGINEERING' | 'CONSULTING'
  | 'FINANCE' | 'PRODUCT' | 'RESEARCH' | 'DESIGN' | 'OPERATIONS'
  | 'ENTREPRENEURSHIP' | 'POLICY' | 'OTHER';

export type TechRole =
  | 'BACKEND_ENGINEER' | 'FRONTEND_ENGINEER' | 'FULL_STACK_ENGINEER'
  | 'MOBILE_ENGINEER' | 'DEVOPS_ENGINEER' | 'PLATFORM_ENGINEER'
  | 'SITE_RELIABILITY_ENGINEER' | 'SECURITY_ENGINEER' | 'QA_ENGINEER'
  | 'EMBEDDED_ENGINEER' | 'SOLUTIONS_ARCHITECT' | 'ENGINEERING_MANAGER' | 'OTHER';

export type ApplyType          = 'EXTERNAL' | 'INTERNAL';
export type RecruiterJobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'REMOVED';
export type ApplicationStatus  =
  | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER'
  | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type JobSource    = 'COMMUNITY' | 'RECRUITER_EXTERNAL' | 'RECRUITER_DIRECT';

export interface PaginatedResponse<T> {
  jobs?:          T[];
  applications?:  T[];
  notifications?: T[];
  invites?:       T[];
  content?:       T[];   // Spring Page default key
  currentPage:    number;
  totalItems:     number;
  totalPages:     number;
}

export interface CompanyResponse {
  id:          number;
  name:        string;
  website?:    string;
  industry?:   string;
  size?:       CompanySize;
  logoUrl?:    string;
  description?: string;
  isVerified:  boolean;
  status:      CompanyStatus;
  createdAt:   string;
}

export interface CompanySearchResult {
  id:               number;
  name:             string;
  website?:         string;
  industry?:        string;
  logoUrl?:         string;
  status:           CompanyStatus;
  domainMatch:      boolean;  // true → can auto-join
  adminName?:       string;   // shown in "contact admin" message
  adminDesignation?: string;
}

export interface RecruiterProfileResponse {
  id:           number;
  userId:       number;
  name:         string;
  company:      CompanyResponse;
  designation?: string;
  isAdmin:      boolean;
  createdAt:    string;
}

export interface TeamMemberResponse {
  id:           number;
  userId:       number;
  name:         string;
  designation?: string;
  role:         TeamMemberRole;
  joinedAt:     string;
}

export interface RecruiterInviteResponse {
  id:           number;
  email:        string;
  intendedRole: TeamMemberRole;
  status:       InviteStatusTeam;
  expiresAt:    string;
  createdAt:    string;
}

export interface JoinRequestResponse {
  id:               number;
  userId:           number;
  companyId:        number;
  companyName:      string;
  message?:         string;
  workEmail?:       string;
  status:           JoinRequestStatus;
  rejectionReason?: string;
  createdAt:        string;
  reviewedAt?:      string;
}

export interface CreateCompanyRequest {
  name:         string;
  website?:     string;
  industry:     string;
  size:         CompanySize;
  description?: string;
  workEmail?:   string;  // used for domain extraction
}

export interface JoinCompanyRequest {
  message?:   string;
  workEmail?: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role?: TeamMemberRole;
}

export interface AcceptInviteRequest {
  token:       string;
  name:        string;
  designation: string;
}

export interface PostJobRequest {
  title:          string;
  roleTitle:      string;
  jobDomain:      JobDomain;
  techRole?:      TechRole;
  location:       string;
  jobDescription?: string;
  minExperience:  number;
  maxExperience:  number;
  applyType:      ApplyType;
  applyUrl?:      string;
  salaryMin?:     number;
  salaryMax?:     number;
  currency?:      string;
  techStack?:     string[];
  skills?:        string[];
  expiresAt?:     string;
}

export interface RecruiterJobResponse {
  id:             number;
  recruiterId:    number;
  companyId:      number;
  companyName:    string;
  title:          string;
  roleTitle:      string;
  jobDomain:      JobDomain;
  techRole?:      TechRole;
  location?:      string;
  jobDescription?: string;
  minExperience:  number;
  maxExperience:  number;
  applyType:      ApplyType;
  applyUrl?:      string;
  salaryMin?:     number;
  salaryMax?:     number;
  currency?:      string;
  techStack:      string[];
  skills:         string[];
  status:         RecruiterJobStatus;
  expiresAt?:     string;
  createdAt:      string;
}

export interface JobFeedItem {
  id:             number;
  source:         JobSource;
  title:          string;
  roleTitle:      string;
  jobDomain:      JobDomain;
  techRole?:      TechRole;
  company:        string;
  location?:      string;
  jobDescription?: string;
  minExperience:  number;
  maxExperience:  number;
  techStack:      string[];
  skills:         string[];
  easyApply:      boolean;
  applyUrl?:      string;
  companyId?:     number;
  recruiterId?:   number;
  salaryMin?:     number;
  salaryMax?:     number;
  currency?:      string;
  verifiedCompany: boolean;
  createdAt:      string;
}

export interface FeedFilterParams {
  domain?:        JobDomain;
  techRole?:      TechRole;
  source?:        JobSource;
  minExperience?: number;
  maxExperience?: number;
  location?:      string;
  postedAfter?:   string;
  techStack?:     string[];
  page?:          number;
  size?:          number;
}

export interface ApplicationResponse {
  id:             number;
  recruiterJobId: number;
  jobTitle:       string;
  companyName:    string;
  status:         ApplicationStatus;
  coverNote?:     string;
  resumeUrl:      string;
  appliedAt:      string;
}

export interface ApplicationDetailResponse {
  id:              number;
  recruiterJobId:  number;
  jobTitle:        string;
  jobseekerId:     number;
  status:          ApplicationStatus;
  coverNote?:      string;
  resumeUrl:       string;
  recruiterNotes?: string;
  appliedAt:       string;
  updatedAt:       string;
}

export interface StatusHistoryItem {
  fromStatus?: ApplicationStatus;
  toStatus:    ApplicationStatus;
  note?:       string;
  changedAt:   string;
}

export interface JobInviteResponse {
  id:              number;
  recruiterId:     number;
  jobseekerId:     number;
  recruiterJobId:  number;
  jobTitle:        string;
  companyName:     string;
  message?:        string;
  status:          InviteStatus;
  applicationId?:  number;
  createdAt:       string;
}

export interface NotificationItem {
  id:        number;
  type:      string;
  title:     string;
  message:   string;
  payload:   Record<string, unknown>;
  isRead:    boolean;
  createdAt: string;
}