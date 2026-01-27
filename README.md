# IITBase Frontend

Clean, minimal frontend for a curated job platform targeting Tier-1 college graduates.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Fetch API for backend communication

## Features

- Public job browsing with filters
- Job detail pages with apply redirect
- User authentication (login/signup)
- Protected job submission form
- Admin moderation dashboard
- Job reporting and removal requests

## Setup

### Prerequisites

- Node.js 18+
- Running IITBase backend at `http://localhost:8080`

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Folder Structure

```
app/
├── layout.tsx              # Root layout with navbar/footer
├── page.tsx                # Homepage
├── jobs/
│   ├── page.tsx            # Job listing with filters
│   └── [id]/page.tsx       # Job detail page
├── login/page.tsx          # Login
├── signup/page.tsx         # Signup
├── submit-job/page.tsx     # Submit job (protected)
└── admin/
    └── jobs/page.tsx       # Admin dashboard (admin only)

components/
├── Navbar.tsx              # Navigation with auth state
├── Footer.tsx              # Site footer
├── JobCard.tsx             # Job preview card
├── JobList.tsx             # List of job cards
├── JobFilters.tsx          # Filter sidebar
├── ReportJobModal.tsx      # Report job modal
├── RemovalRequestModal.tsx # Request removal modal
└── ProtectedRoute.tsx      # Auth guard component

lib/
├── api.ts                  # All API calls
├── auth.ts                 # JWT token management
└── constants.ts            # Enums and dropdown values

types/
├── job.ts                  # Job types
└── user.ts                 # User types
```

## Design Principles

1. **Clean and minimal** - No unnecessary animations or visual noise
2. **Mobile-first** - Responsive design for all screen sizes
3. **Professional tone** - Serious platform for serious opportunities
4. **User trust** - Community reporting and transparent moderation

## API Integration

All API calls are centralized in `lib/api.ts`. The backend base URL is configured via environment variable. JWT tokens are stored in localStorage and automatically included in authenticated requests.

## Authentication Flow

1. User logs in or signs up
2. JWT token and role stored in localStorage
3. Protected routes check authentication status
4. Admin routes verify ADMIN role
5. Logout clears localStorage and redirects to login

## Key Components

- **ProtectedRoute**: Wraps pages requiring authentication, redirects to login if not authenticated
- **JobFilters**: Controls all filtering logic for job search
- **ReportJobModal**: Community-driven quality control
- **RemovalRequestModal**: Allows recruiters to request job removal

## Interview Talking Points

- Why App Router over Pages Router? (Better server components, improved routing)
- How is authentication handled? (JWT in localStorage, client-side validation)
- Why centralize API calls? (Single source of truth, easier testing, consistent error handling)
- How would you add analytics? (Google Analytics, Mixpanel via custom hooks)
- How would you improve performance? (Image optimization, code splitting, caching)