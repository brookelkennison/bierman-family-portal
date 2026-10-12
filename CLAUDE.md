# Bierman Family Portal

Take-home for Bierman Autism Centers. Read PLAN.md before changing anything.
Scope: create and read appointments, run locally. Update and delete show as Coming soon.

- Plan: PLAN.md
- Mockups: https://www.figma.com/design/Xnyq8R0Y9v9PYiz0IMo8Rv (page "Mockups v4")
- Planning board: https://www.figma.com/board/4PoFJM4jzUJpHQIFjq1soy
- Tickets: GitHub Issues and the Project board

## Folders

- app/ routes and pages
- components/ shared UI, plain Tailwind and native HTML (no component library)
- lib/ helpers, Supabase clients, Zod schemas
- supabase/ migrations, seed, DB tests
- e2e/ Playwright end-to-end tests (with axe)
- tests/unit/ Vitest unit tests
- docs/ security, architecture, accessibility, design QA, ADRs

## Commands

pnpm dev · pnpm check (lint, style check, typecheck, format check, unit tests) · pnpm format

pnpm test:e2e (Playwright against a production build; run pnpm seed after) · pnpm screenshots (refresh docs/screenshots)

pnpm db:push (apply migrations to the hosted project) · pnpm db:types (regenerate lib/database.types.ts after a migration)

pnpm test:db (pgTAP tests in supabase/tests; runs in CI against a throwaway database, needs Docker locally)

pnpm seed (demo data and logins into the hosted project; needs .env.seed with the secret key, which never leaves that file)

Before every commit: pnpm format, then pnpm check, then git add. Commit command lists always include pnpm format before git add.

## How to work with me

- Use pnpm, never npm.
- I'm learning Supabase and RLS. Explain each migration and policy before writing it.
- One file at a time. Use plan mode for anything bigger.
- TypeScript only, no .js outside config files.
- Use theme tokens from app/globals.css and shared components. No hard-coded hex values or arbitrary pixel classes.
- Next.js 16 changed a lot: check AGENTS.md and node_modules/next/dist/docs before writing Next code.
- Fake data only. Never put real names, PHI, or secrets in code, logs, or prompts.
