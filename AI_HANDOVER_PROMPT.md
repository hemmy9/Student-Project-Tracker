# AI handover prompt — Student Project Tracker FYP

Copy the prompt below into a new ChatGPT, Claude, or VS Code Copilot conversation.

---

You are taking over Student Project Tracker FYP. Read `PROJECT_BREAKDOWN.md`, check `git log`, check `student-portal/src/App.tsx` routes, check `Home.tsx` design from the `wa_image` reference, continue building the project.

## Current repository facts

- The base commit `e2381a1` fixed the earlier deployed `ReferenceError: React is not defined` by restoring the React import. The TechCool-inspired landing/auth redesign and chat fallback requested after that checkpoint are implemented in the current checkout; inspect `git log` for the follow-up commit and validate before extending them.
- Both deployments are separate Vite/React apps from the same GitHub `main` branch:
  - Student: <https://studentportal-eta-eight.vercel.app>, root `student-portal/`.
  - Supervisor: <https://supervisor-portal-ten.vercel.app>, root `supervisor-portal/`.
- Both use Supabase project `https://trcbyhouobuomteokyrk.supabase.co`.
- In this checkout the route files are `src/App.jsx`, not `src/App.tsx`. Page components are `src/pages/Home.tsx` and `src/pages/Login.tsx`. The original supplied reference image was named `Effortless.jpg` in the repository-root working directory; it was a local untracked reference, not a shipped application asset. Check whether it exists before using it.
- Student dashboard route: `/dashboard`. Supervisor dashboard route: `/dashboard` on the separate supervisor domain (`/supervisor-dashboard` is a compatibility redirect).
- The prior React-render blank screen was caused by a missing React runtime import, not by Supabase data or mismatched localStorage keys. The current named session keys are `student_user` and `supervisor_user`.

## Demo accounts and browser-only demo signup

- Student: `student@test.com` / `123456` → `student_user`, id `demo-student-1`, student `/dashboard`.
- Supervisor: `supervisor@test.com` / `123456` → `supervisor_user`, id `demo-sup-1`, supervisor `/dashboard`.
- Local signup accounts are stored under `fyp_users` in the browser. These are demo accounts, not Supabase Auth registrations.
- Chat's local fallback is `fyp_messages`. It is origin-specific and cannot share messages across the two different Vercel domains. Shared chat requires the Supabase `messages` table, correct columns, RLS, and Realtime publication.

## Folder summary

- `student-portal/src/pages/`: student Home and Login/Signup modal.
- `student-portal/src/components/ChatPanel.jsx`: student chat and local fallback.
- `student-portal/src/App.jsx`: student routes, session restore, dashboard, uploads and feedback.
- `supervisor-portal/src/pages/`: supervisor Home and Login/Signup modal.
- `supervisor-portal/src/components/ChatPanel.jsx`: selected-student chat and local fallback.
- `supervisor-portal/src/App.jsx`: supervisor routes, session restore, student dashboard, document review and feedback.
- Both `src/lib/` folders: shared-per-portal Supabase client, storage/session bridge, progress helper, and client-side permission helper.
- Both `supabase/setup.sql` files: additive changes to existing `students`/`documents`, supervisor and messages table creation, and Realtime publication additions. They do not create all base tables or configure RLS.
- Both `vercel.json` files: SPA deep-link rewrite.
- `legacy/`: archived source, not included in current Vite production builds.
- `PROJECT_BREAKDOWN.md`: detailed current architecture, behavior, and known gaps.
- `.github/`, `LICENSE`, root `.gitignore`, and root `README.md`: code ownership, security reporting, proprietary notice, and manual protection steps.

## What works and what needs checking

- Both portals are separate, role-focused apps with responsive TechCool-inspired CSS landing pages and modal Login/Sign Up forms.
- Built-in demo bypass works without Supabase; local demo signup and Supabase Auth password login are separate flows.
- Dashboards support task/progress display, student chapter document upload, supervisor document approval/rejection and feedback.
- Realtime chat is implemented against the Supabase `messages` table; localStorage fallback is labeled local-only.
- Database-dependent dashboard screens require the pre-existing Supabase tables and the additive `setup.sql`; run/verify the SQL in Supabase if live data/review is missing.
- Still verify signup/login in both roles, chat with two genuine portal sessions, current Supabase columns/policies, mobile layout, and the exact Vercel deployments after each push.
- Project CRUD, grading, bulk approval, search/filter, and calendar (including the requested October 2024 calendar) are not currently implemented. Do not describe these as completed.

## Pending checklist

- [ ] Finish/polish the cap, glowing ring, rock and floating-card visual effects (currently CSS illustration, not a 3D engine).
- [ ] Test shared chat end-to-end with two authenticated users and Supabase Realtime enabled.
- [ ] Test signup and role validation in both portals.
- [ ] Protect GitHub: make the repo private, review access/forks/actions, and configure `main` branch protection in GitHub UI.

## Resume commands

Start by checking state; never overwrite user changes:

```powershell
git status --short --branch
git log --oneline -5
npm --prefix student-portal run build
npm --prefix supervisor-portal run build
```

To run the portals locally in separate terminals:

```powershell
npm --prefix student-portal run dev
npm --prefix supervisor-portal run dev
```

## Supabase settings and safety

- Local example settings are in `student-portal/.env.example` and `supervisor-portal/.env.example`; Vercel environment variables are configured separately in each project.
- Shared variable names: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_STORAGE_BUCKET`.
- The publishable/anon key is public by design. Never expose or commit a Supabase service-role key.
- The browser-only role checks and local demo data are not authorization. Configure Supabase Auth, RLS, and Storage access policies before using real student information.

---
