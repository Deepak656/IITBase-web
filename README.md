# IITBase Frontend

Frontend for [IITBase](https://iitbase.com) — a curated job platform and peer network for IIT graduates.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Fetch API** — all requests go through a centralized `lib/api.ts`

## Getting Started

### Prerequisites

- Node.js 18+
- IITBase backend running at `http://localhost:8080`

### Install

```bash
npm install
```

### Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Run

```bash
npm run dev        # development
npm run build      # production build
npm start          # serve production build
```

---

## Project Structure

```
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── jobs/
│   ├── page.tsx
│   └── [id]/page.tsx
├── submit-job/page.tsx
├── login/page.tsx
├── signup/
│   ├── page.tsx
│   ├── SignupClient.tsx
│   └── components/
│       ├── StepWelcome.tsx
│       ├── StepIntentEmail.tsx
│       ├── StepOtpPassword.tsx
│       ├── StepSuccess.tsx
│       ├── JobSeekerOnboardingForm.tsx
│       └── RecruiterOnboardingForm.tsx
├── profile/page.tsx
├── reset-password/page.tsx
├── admin/
│   └── jobs/page.tsx
├── about/page.tsx
├── careers/page.tsx
├── contact/page.tsx
├── feedback/page.tsx
├── privacy/page.tsx
└── terms/page.tsx

components/
├── Navbar.tsx
├── Footer.tsx
├── JobCard.tsx
├── JobList.tsx
├── JobFilters.tsx
├── MySubmissions.tsx
├── ProfileSettings.tsx
├── ProtectedRoute.tsx
├── ReportJobModal.tsx
└── RemovalRequestModal.tsx

context/
└── AuthContext.tsx

lib/
├── api.ts
├── auth.ts
├── constants.ts
└── feedback.ts

types/
├── job.ts
└── user.ts

public/
├── logo-icon.svg
├── logo-lockup.svg
└── logo-wordmark.svg
```

---

## Authentication

JWT tokens are stored in `localStorage` and automatically attached to every authenticated request via the `fetchApi` wrapper in `lib/api.ts`.

Flow:
1. User logs in or completes signup OTP verification
2. Backend returns a JWT — stored via `setToken()`
3. `AuthContext` calls `/user/me` on mount to hydrate user state (email, role)
4. Protected routes check `isAuthenticated` from context
5. Admin routes additionally check `isAdmin` (role === `'ADMIN'`)
6. On logout or 401 response, token is cleared and user is redirected to `/login`

Role is always sourced from the `/user/me` API response — never decoded from the token client-side.

---

## API Layer

All backend communication goes through `lib/api.ts`. It handles:

- Auth header injection
- 401/403 detection → fires `auth:unauthorized` custom event → global logout
- Consistent error messaging from backend response body

Base URL is configured via `NEXT_PUBLIC_API_URL`.

---

## Features

- Browse and filter live job listings (public, no auth required)
- Job detail pages with direct apply link
- Multi-step OTP-based signup with job seeker / recruiter onboarding
- Password reset via OTP
- Authenticated job submission (pending admin approval)
- Submission history and status tracking via profile
- Community job reporting
- Recruiter-initiated removal requests
- Admin dashboard for approving, rejecting, and expiring listings
- Static pages — about, careers, contact, feedback, privacy, terms

---

## Design Notes

- No animations, no gradients, no fluff — optimized for fast scanning
- Mobile-first layout, tested down to 375px
- Inter font, neutral grays, minimal color usage
- Every state (loading, error, empty) is explicitly handled