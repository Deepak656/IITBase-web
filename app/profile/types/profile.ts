// ─────────────────────────────────────────────────────────────────────────────
// Profile types — mirrors backend DTOs exactly
// Source of truth: Java DTO classes in com.iitbase.jobseeker.dto
// ─────────────────────────────────────────────────────────────────────────────

export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';
export type GradeType = 'CGPA' | 'PERCENTAGE' | 'GPA';

// Backend comment in JobPreferenceDTO.java: REMOTE, HYBRID, ONSITE
export type WorkLocationType = 'REMOTE' | 'HYBRID' | 'ONSITE';

// Backend comment in JobPreferenceDTO.java: IMMEDIATE, 15_DAYS, 30_DAYS, 60_DAYS, 90_DAYS
export type NoticePeriod = 'IMMEDIATE' | '15_DAYS' | '30_DAYS' | '60_DAYS' | '90_DAYS';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface WorkExperienceDTO {
  id?: number;
  company: string;
  title: string;
  location?: string;
  employmentType?: EmploymentType;
  startMonth?: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  isCurrent?: boolean;
  description?: string;
  skillsUsed?: string;
  displayOrder?: number;
}

export interface EducationDTO {
  id?: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  gradeType?: GradeType;
  description?: string;
  displayOrder?: number;
}

export interface SkillDTO {
  id?: number;
  name: string;
  proficiencyLevel?: ProficiencyLevel;
  yearsOfExperience?: number;
  displayOrder?: number;
}

export interface ProjectDTO {
  id?: number;
  title: string;
  description?: string;
  techStack?: string;
  projectUrl?: string;
  repoUrl?: string;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  isOngoing?: boolean;
  displayOrder?: number;
}

export interface CertificationDTO {
  id?: number;
  name: string;
  issuer: string;
  issueMonth?: number;
  issueYear?: number;
  expiryMonth?: number;
  expiryYear?: number;
  doesNotExpire?: boolean;
  credentialId?: string;
  credentialUrl?: string;
  displayOrder?: number;
}

export interface JobPreferenceDTO {
  id?: number;
  currentLocation?: string;
  workLocationType?: WorkLocationType;  // REMOTE | HYBRID | ONSITE
  preferredCities?: string[];
  previousSalary?: number;              // BigDecimal on backend, number in TS
  previousSalaryCurrency?: string;
  expectedSalary?: number;
  expectedSalaryCurrency?: string;
  noticePeriod?: NoticePeriod;          // String enum: IMMEDIATE, 15_DAYS, etc.
  primaryRole?: string;
  openToRoles?: string[];
}

export interface JobseekerProfileDTO {
  id: number;
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
  profileCompletion?: number;           // Integer — can be null on a brand-new profile

  // Nested sections — all returned by GET /api/v1/profile
  workExperiences: WorkExperienceDTO[];
  educations: EducationDTO[];
  skills: SkillDTO[];
  projects: ProjectDTO[];
  certifications: CertificationDTO[];
  jobPreference?: JobPreferenceDTO;
}

// PUT /api/v1/profile/basic request body
export interface BasicInfoRequest {
  fullName?: string;
  phone?: string;
  headline?: string;
  summary?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  isOnCareerBreak?: boolean;
}

// Alias used by BasicInfoForm
export type JobseekerBasicInfoRequest = BasicInfoRequest;

export interface CompletionNudge {
  label: string;
  points: number;
  action: string;
}

// ─── Label maps ───────────────────────────────────────────────────────────────

export const WORK_LOCATION_LABELS: Record<WorkLocationType, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

export const NOTICE_PERIOD_LABELS: Record<NoticePeriod, string> = {
  IMMEDIATE: 'Immediate',
  '15_DAYS': '15 days',
  '30_DAYS': '30 days',
  '60_DAYS': '60 days',
  '90_DAYS': '90 days',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDateRange(
  startMonth?: number,
  startYear?: number,
  endMonth?: number,
  endYear?: number,
  isCurrent?: boolean,
): string {
  const start = startYear
    ? `${startMonth ? MONTH_NAMES[startMonth - 1] + ' ' : ''}${startYear}`
    : '';
  const end = isCurrent
    ? 'Present'
    : endYear
    ? `${endMonth ? MONTH_NAMES[endMonth - 1] + ' ' : ''}${endYear}`
    : '';
  if (!start && !end) return '';
  if (!end) return start;
  return `${start} – ${end}`;
}