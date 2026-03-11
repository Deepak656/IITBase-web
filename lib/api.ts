import { getToken, removeToken } from './auth';
import type { Job, JobListResponse, JobCreateRequest, MyJobsResponse, MyJobsStatsResponse } from '../types/job';
import type { LoginRequest, SignupRequest, AuthResponse } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http:api.iitbase.com/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: number; // 👈 added, but not used
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  console.log('API:', endpoint, 'TOKEN:', token); // 👈 add this

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

  // 🔐 Handle auth failures explicitly
  if (response.status === 401 || response.status === 403) {
    // optional: clear token + redirect later
    removeToken();
    // Trigger global logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error('Session expired. Please login again.');
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
      fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: () =>
      fetchApi<void>('/auth/logout', { method: 'POST' }),

    logoutAll: () =>
      fetchApi<void>('/auth/logout-all', { method: 'POST' }),

    requestSignupOtp: (email: string) =>
      fetchApi<void>(`/auth/signup/request-otp?email=${email}`, { method: 'POST' }),

    verifySignupOtp: (otp: string, data: SignupRequest) =>
      fetchApi<AuthResponse>(`/auth/signup/verify-otp?otp=${otp}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    requestPasswordOtp: (email: string) =>
      fetchApi<void>(`/auth/password/request-otp?email=${email}`, { method: 'POST' }),

    resetPassword: (email: string, otp: string, newPassword: string) =>
      fetchApi<void>(
        `/auth/password/reset?email=${email}&otp=${otp}&newPassword=${encodeURIComponent(newPassword)}`,
        { method: 'POST' }
      ),

    resendOtp: (email: string, purpose: 'SIGNUP' | 'RESET_PASSWORD') =>
      fetchApi<void>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose }),
      }),
  },

  user: {
    me: () => fetchApi<{ 
      email: string; 
      role: string; 
      college?: string; 
      graduationYear?: number; 
      activeSessions?: number }>('/user/me'),
    
    updateProfile: (data: { college?: string; graduationYear?: number }) =>
      fetchApi<{ email: string; role: string; college?: string; graduationYear?: number }>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      fetchApi<void>('/user/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    deleteAccount: (confirmEmail: string) =>
      fetchApi<void>(`/user/account?confirmEmail=${confirmEmail}`, {
        method: 'DELETE',
      }),
    
    getActiveSessions: () =>
      fetchApi<number>('/user/sessions'),
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
    return fetchApi<JobListResponse>(`/public/jobs?${query}`);
  },

  getById: (id: number) => fetchApi<Job>(`/public/jobs/${id}`),

  submit: (data: JobCreateRequest) =>
    fetchApi<void>('/jobs/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  report: (id: number, reason: string, comment: string) =>
    fetchApi<void>(`/jobs/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, comment }),
    }),

  requestRemoval: (id: number, requesterEmail: string, reason: string) =>
    fetchApi<void>(`/jobs/${id}/removal-request`, {
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
      `/jobs/my-submissions${query ? `?${query}` : ''}`
    );
  },
    // New: Get submission statistics
  mySubmissionsStats: () => 
    fetchApi<MyJobsStatsResponse>('/jobs/my-submissions/stats'),
},

  admin: {
    getPending: () => fetchApi<Job[]>('/admin/jobs/pending'),
    getReported: () => fetchApi<Job[]>('/admin/jobs/reported'),
    approve: (id: number) =>
      fetchApi<void>(`/admin/jobs/${id}/approve`, { method: 'POST' }),
    reject: (id: number) =>
      fetchApi<void>(`/admin/jobs/${id}/reject`, { method: 'POST' }),
    markExpired: (id: number) =>
      fetchApi<void>(`/admin/jobs/${id}/mark-expired`, { method: 'POST' }),
  },
};