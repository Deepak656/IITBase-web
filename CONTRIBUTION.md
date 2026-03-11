# Contributing to IITBase

Thanks for your interest in contributing. IITBase is being built as an open source project for the IIT community — by IITians, for IITians. Every contribution helps.

---

## What you can work on

- Bug fixes
- UI improvements
- New features (open an issue first before starting)
- Documentation
- Performance improvements

If you're unsure where to start, look for issues labeled `good first issue`.

---

## Getting started

### 1. Fork the repo

Click **Fork** on the top right of the repo page.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/IITBase-web-v1.git
cd IITBase-web-v1
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 5. Run locally

```bash
npm run dev
```

---

## Branch naming

Branch off from `main` and follow this convention:

```
feature/your-feature-name
fix/what-you-are-fixing
chore/what-you-are-doing
```

Examples:
```
feature/mobile-navbar
fix/job-filter-reset
chore/update-readme
```

---

## Making a pull request

1. Make sure your changes work locally and don't break the build (`npm run build`)
2. Keep PRs focused — one fix or feature per PR
3. Write a clear PR title and description explaining what and why
4. Link the related issue if one exists (e.g. `Closes #12`)
5. Open the PR against the `main` branch

---

## Code style

- TypeScript everywhere — no `any` unless absolutely necessary
- Tailwind for styling — no inline styles, no external CSS files
- Keep components small and focused
- If you're adding a new page, follow the existing folder structure under `app/`
- If you're adding a new API call, add it to `lib/api.ts` — don't fetch directly from components

---

## Opening issues

Before opening an issue:
- Check if it already exists
- For bugs, include steps to reproduce, expected behavior, and actual behavior
- For features, explain the use case and why it belongs in IITBase

---

## Questions

Open a Discussion if you have questions about the codebase or want to propose something before writing code. That's what Discussions are for.

---

## A note

This project is early stage and moving fast. If something in the codebase looks rough, it probably is — PRs to clean things up are just as welcome as new features.