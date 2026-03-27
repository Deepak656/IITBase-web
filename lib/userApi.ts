import { getToken, removeToken } from './auth';

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

export const userApi = {
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
  }
};