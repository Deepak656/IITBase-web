import { getToken, removeToken } from './auth';
import type { Job, JobListResponse, JobCreateRequest, MyJobsResponse, MyJobsStatsResponse } from '../types/job';
import type { LoginRequest, SignupRequest, AuthResponse } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.iitbase.com';

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: number; // 👈 added, but not used
}
const PUBLIC_ENDPOINTS = [
  '/api/auth/signup/request-otp',
  '/api/auth/signup/verify-otp',
  '/api/auth/password/request-otp',
  '/api/auth/password/reset',
  '/api/auth/resend-otp',
  '/api/public/',
];

const isPublicEndpoint = (endpoint: string) =>
  PUBLIC_ENDPOINTS.some((pub) => endpoint.startsWith(pub));
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Only logout for protected endpoints
  if (response.status === 401 || response.status === 403) {
    if (!isPublicEndpoint(endpoint)) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw new Error('Session expired. Please login again.');
    }
    // public endpoint 401 — just throw, let the caller handle it
    throw new Error('Request failed. Please try again.');
  }

  let body: ApiResponse<T> | null = null;

  try {
    body = await response.json();
  } catch {
    // backend returned no JSON (rare, but possible)
  }

  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }

  // Optional safety check
  if (!body?.success) {
    throw new Error(body?.message || 'Request failed');
  }

  return body.data;
}

export const api = {
  auth: {
    login: (data: LoginRequest) =>
      fetchApi<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: () =>
      fetchApi<void>('/api/auth/logout', { method: 'POST' }),

    logoutAll: () =>
      fetchApi<void>('/api/auth/logout-all', { method: 'POST' }),

    requestSignupOtp: (email: string) =>
      fetchApi<void>(`/api/auth/signup/request-otp?email=${email}`, { method: 'POST' }),

    verifySignupOtp: (otp: string, data: SignupRequest) =>
      fetchApi<AuthResponse>(`/api/auth/signup/verify-otp?otp=${otp}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    requestPasswordOtp: (email: string) =>
      fetchApi<void>(`/api/auth/password/request-otp?email=${email}`, { method: 'POST' }),

    resetPassword: (email: string, otp: string, newPassword: string) =>
      fetchApi<void>(
        `/api/auth/password/reset?email=${email}&otp=${otp}&newPassword=${encodeURIComponent(newPassword)}`,
        { method: 'POST' }
      ),
        // Step 1a: send OTP to the user's CURRENT email (requires auth token)
    verifyCurrentEmailRequestOtp: () =>
      fetchApi<void>('/api/auth/change-email/verify-current/request-otp', {
        method: 'POST',
      }),
 
    // Step 1b: validate OTP from current email (requires auth token)
    verifyCurrentEmailOtp: (otp: string) =>
      fetchApi<void>(`/api/auth/change-email/verify-current?otp=${otp}`, {
        method: 'POST',
      }),
    // Step 2a: send OTP to the NEW email (requires auth token)  
    changeEmailRequestOtp: (newEmail: string) =>
      fetchApi<void>('/api/auth/change-email/request-otp', {
        method: 'POST',
        body: JSON.stringify({ newEmail }),
      }),
      // Step 2b: validate new-email OTP and apply the change (requires auth token)
    changeEmailVerify: (newEmail: string, otp: string) =>
      fetchApi<void>('/api/auth/change-email/verify', {
        method: 'POST',
        body: JSON.stringify({ newEmail, otp }),
      }), 
    resendOtp: (email: string, purpose: 'SIGNUP' | 'RESET_PASSWORD') =>
      fetchApi<void>('/api/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose }),
      }),
  },

  user: {
    me: () => fetchApi<{ 
      email: string; 
      role: string; 
      activeSessions?: number }>('/api/user/me'),
    
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      fetchApi<void>('/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    deleteAccount: (confirmEmail: string) =>
      fetchApi<void>(`/api/user/account?confirmEmail=${confirmEmail}`, {
        method: 'DELETE',
      }),
    
    getActiveSessions: () =>
      fetchApi<number>('/api/user/sessions'),
  },

jobs: {
  list: (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return fetchApi<JobListResponse>(`/api/public/jobs?${query}`);
  },

  getById: (id: number) => fetchApi<Job>(`/api/public/jobs/${id}`),

  submit: (data: JobCreateRequest) =>
    fetchApi<void>('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  report: (id: number, reason: string, comment: string) =>
    fetchApi<void>(`/api/jobs/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, comment }),
    }),

  requestRemoval: (id: number, requesterEmail: string, reason: string) =>
    fetchApi<void>(`/api/jobs/${id}/removal-request`, {
      method: 'POST',
      body: JSON.stringify({ requesterEmail, reason }),
    }),

  // Updated mySubmissions with proper pagination and status filter
  mySubmissions: (params?: {
    statuses?: string[];  // ['PENDING', 'APPROVED', etc.]
    page?: number;
    size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.statuses && params.statuses.length > 0) {
      params.statuses.forEach(status => {
        queryParams.append('statuses', status);
      });
    }
    
    if (params?.page !== undefined) {
      queryParams.set('page', String(params.page));
    }
    
    if (params?.size !== undefined) {
      queryParams.set('size', String(params.size));
    }
    
    const query = queryParams.toString();
    return fetchApi<MyJobsResponse>(
      `/api/jobs/my-submissions${query ? `?${query}` : ''}`
    );
  },
    // New: Get submission statistics
  mySubmissionsStats: () => 
    fetchApi<MyJobsStatsResponse>('/api/jobs/my-submissions/stats'),
},

  admin: {
    getPending: () => fetchApi<Job[]>('/api/admin/jobs/pending'),
    getReported: () => fetchApi<Job[]>('/api/admin/jobs/reported'),
    approve: (id: number) =>
      fetchApi<void>(`/api/admin/jobs/${id}/approve`, { method: 'POST' }),
    reject: (id: number) =>
      fetchApi<void>(`/api/admin/jobs/${id}/reject`, { method: 'POST' }),
    markExpired: (id: number) =>
      fetchApi<void>(`/api/admin/jobs/${id}/mark-expired`, { method: 'POST' }),
  },
};