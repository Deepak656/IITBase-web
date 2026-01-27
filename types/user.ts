export interface User {
  email: string;
  role: 'ADMIN' | 'JOB_SEEKER' | 'RECRUITER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
  college?: string;
  graduationYear?: number;
}

export interface AuthResponse {
  token: string;
  role: string;
}