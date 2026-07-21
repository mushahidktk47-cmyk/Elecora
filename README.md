# Elecora

AI-powered electrical engineering platform — starting as a toolkit for
Electrical Engineering students, expanding later to engineers, technicians,
electricians, educators, and citizens.

This README explains the **architecture**, not the product features. See the
project's planning docs for the feature roadmap.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js (App Router) |
| UI library | React + TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Backend | Supabase (Postgres + Auth) |
| Hosting | Vercel |
| Tests | Vitest |

## Folder structure

```
src/
├── app/
│   ├── (marketing)/       Public pages (home, about). Route group — doesn't
│   │                      affect the URL, just organizes files.
│   ├── (auth)/            Login / signup pages.
│   ├── (dashboard)/       Logged-in area: calculators, learn, quizzes,
│   │                      tutor, saved calculations.
│   └── api/               Server-only API routes. This is the ONLY place
│                          allowed to call Supabase with elevated privileges
│                          or call an AI provider — never do this from a
│                          component that runs in the browser.
│
├── components/
│   ├── ui/                shadcn/ui components (Button, Card, etc.)
│   ├── calculators/       Calculator-specific UI (forms, result displays)
│   ├── quizzes/           Quiz UI
│   └── shared/            Navbar, Footer, layout pieces used everywhere
│
├── lib/
│   ├── supabase/          Supabase client setup (browser + server variants)
│   ├── ai/                AI provider abstraction. UI code calls a single
│   │                      interface here; this folder decides which real
│   │                      AI provider (OpenAI, Anthropic, etc.) handles it.
│   └── validation/        Input validation schemas (Zod)
│
├── calculations/          THE DETERMINISTIC ENGINE. Plain TypeScript
│                          functions only — no React, no Next.js, no
│                          network calls. Input in, typed result out.
│                          This is the only code allowed to produce a
│                          number that gets shown to the user as "the
│                          answer." Every function here needs tests.
│
├── content/               Structured data for the Learn section
│   ├── formulas/          (formulas + concepts + worked examples, unified)
│   └── concepts/
│
├── types/                 Shared TypeScript types used across the app
└── hooks/                 Custom React hooks
```

## Core architectural rule

**The deterministic calculation engine (`src/calculations/`) and the AI
layer (`src/lib/ai/`) are kept strictly separate.**

- `src/calculations/` produces numeric engineering results. It is
  reviewed, tested, and version-controlled like safety-critical code,
  because it is.
- The AI Tutor explains concepts and guides learning. If a user asks it to
  compute a number, it calls into `src/calculations/` rather than
  calculating the answer itself with the language model.

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. `.env.local`
is git-ignored and must never be committed. Any variable prefixed
`NEXT_PUBLIC_` is bundled into browser-visible code — secrets must never
use that prefix.

## Getting started

```bash
npm install
npm run dev      # start local dev server
npm run test      # run tests once
npm run test:watch
npm run lint
npm run build     # production build
```
