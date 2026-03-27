# IITBase Frontend — New Pages Integration Guide

## Files Generated

```
lib/
  recruiterApi.ts          ← All API calls + TypeScript types for new modules

components/
  notifications/
    NotificationBell.tsx   ← Drop into navbar. SSE + polling + badge count.
  jobs/
    Modals.tsx             ← ApplyModal + SendInviteModal (two exports)

recruiter/
  onboarding/page.tsx      ← /recruiter/onboarding — 2-step company+profile
  jobs/
    page.tsx               ← /recruiter/jobs — my listings dashboard
    new/page.tsx           ← /recruiter/jobs/new — post a job form
    [id]/applicants/
      page.tsx             ← /recruiter/jobs/[id]/applicants — kanban pipeline

applications/
  page.tsx                 ← /applications — jobseeker my applications

invites/
  page.tsx                 ← /invites — jobseeker received invites
```

---

## Step 1 — Add routes to app/ directory

Copy each folder/file into your Next.js `app/` directory matching the paths above.

---

## Step 2 — Add NotificationBell to navbar

Find your navbar component and add:

```tsx
import NotificationBell from '@/components/notifications/NotificationBell';

// Inside your navbar JSX:
<NotificationBell />
```

Place it next to the user menu / logout button.

---

## Step 3 — Wire recruiterApi.ts to your existing api object

Your existing code uses `api.user.me()`, `api.auth.logout()` etc.
Two options:

**Option A** — Import from recruiterApi directly in new pages (already done in generated files):
```ts
import { recruiterJobApi, applicationApi } from '@/lib/recruiterApi';
```

**Option B** — Merge into your existing `api` object:
```ts
// In your existing lib/api.ts
import { companyApi, recruiterApi, ... } from './recruiterApi';
export const api = {
  ...existingApi,
  company: companyApi,
  recruiter: recruiterApi,
  // etc.
};
```

The `getToken()` function in recruiterApi.ts reads from `localStorage.getItem('token')`.
**Update this to match how your existing auth stores the token.** Check your `lib/auth.ts`.

---

## Step 4 — Add auth guards for recruiter pages

Your existing app likely has route protection. Add to `recruiter/layout.tsx`:

```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'RECRUITER')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return null;
  return <>{children}</>;
}
```

---

## Step 5 — Add nav links

Add to your navbar/sidebar for logged-in users:

```tsx
// For RECRUITER role:
{ label: 'My Jobs',    href: '/recruiter/jobs' }
{ label: 'Post a Job', href: '/recruiter/jobs/new' }

// For JOB_SEEKER role:
{ label: 'My Applications', href: '/applications' }
{ label: 'Invitations',     href: '/invites' }

// For both roles:
{ label: 'Notifications', href: '/notifications' }
```

---

## Step 6 — Wire ApplyModal on job detail page

In your existing `jobs/[id]/page.tsx`, add the apply button:

```tsx
import { ApplyModal } from '@/components/jobs/Modals';

// In component state:
const [applyOpen, setApplyOpen] = useState(false);
const [applied, setApplied] = useState(false);

// In JSX — show for easyApply jobs:
{job.easyApply && !applied && (
  <button onClick={() => setApplyOpen(true)}
    className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg">
    ✅ Apply on IITBase
  </button>
)}

{applyOpen && (
  <ApplyModal
    jobId={job.id}
    jobTitle={job.title}
    companyName={job.company}
    resumeFileName={profile?.resumeFileName}
    onSuccess={() => { setApplyOpen(false); setApplied(true); }}
    onClose={() => setApplyOpen(false)}
  />
)}
```

---

## Step 7 — Update jobs/page.tsx to use unified feed

Your existing `jobs/page.tsx` probably calls `/api/public/jobs`.
Update to use `/api/public/feed` via `feedApi.get()` from recruiterApi.ts.
The response now includes `easyApply`, `verifiedCompany`, `source` fields.

---

## Step 8 — Recruiter onboarding after signup

In your existing `signup/components/RecruiterOnboardingForm.tsx`,
after successful signup with role=RECRUITER, redirect to:
```
/recruiter/onboarding
```

---

## SSE Note

The SSE endpoint requires JWT. The generated `NotificationBell.tsx` appends
`?token=...` to the URL. Your Spring Security config needs to allow
token-in-query-param for the SSE endpoint:

```java
// In SecurityConfig.java, add SSE endpoint to permit list or handle
// token extraction from query param in JwtAuthenticationFilter
```

Alternatively, change SSE to use a cookie-based auth approach.

---

## Design tokens used (matching your existing codebase)

| Token | Usage |
|-------|-------|
| `bg-gray-50` | Page backgrounds |
| `bg-white rounded-xl border border-gray-200` | Cards |
| `text-teal-600`, `bg-teal-600` | Primary actions |
| `animate-pulse` + skeleton divs | Loading states |
| `space-y-3/4` | Section spacing |
| `max-w-3xl/5xl mx-auto px-4 py-8` | Page containers |
| `text-sm` | Body text |
| `text-xs` | Labels, meta |