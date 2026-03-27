export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;

  jobDescription?: string;

  applyUrl: string;
  sourceUrl?: string;

  roleTitle: string;
  jobDomain: string;
  techRole?: string;

  minExperience: number;
  maxExperience: number;

  techStack: string[];
  skills?: string[];

  tierOneReason: string;

  createdAt: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'EXPIRED';
}

export interface JobListResponse {
  jobs: Job[];
  page: number;
  totalPages: number;
}
export interface MyJobsResponse {
  jobs: Job[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
export interface MyJobsStatsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  underReview: number;
  expired: number;
}
export interface JobCreateRequest {
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  sourceUrl?: string;
  jobDescription?: string;

  minExperience: number;
  maxExperience: number;

  jobDomain: 'TECHNOLOGY' | 'PRODUCT' | 'ANALYTICS' | 'CONSULTING';

  techRole?: string; // required if TECHNOLOGY
  roleTitle: string;

  techStack: string[];
  skills: string[];

  tierOneReason: string;
}