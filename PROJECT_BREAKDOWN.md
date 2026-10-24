# Student Project Tracker FYP — Project Breakdown

## Section 1: Project overview

Student Project Tracker is a final-year-project workspace with separate student and supervisor front ends. Students can monitor task progress, upload chapter documents, read review feedback, and chat with a supervisor. Supervisors can inspect student/project records, review submitted documents, approve or reject them with feedback, and use the same project chat.

The two independently deployed portals share one Supabase project:

| Portal | Source root | Production URL | Main dashboard |
| --- | --- | --- | --- |
| Student | `student-portal/` | <https://studentportal-eta-eight.vercel.app> | `/dashboard` |
| Supervisor | `supervisor-portal/` | <https://supervisor-portal-ten.vercel.app> | `/dashboard` (legacy alias `/supervisor-dashboard`) |

**Technology stack**

- React 18 for UI and component state.
- Vite 6 for local development and production bundles.
- React Router 6 for client-side routes.
- Supabase JavaScript client for Auth, Postgres queries, Storage, and Realtime.
- `localStorage` for the named demo session/account/chat fallbacks; LocalForage is retained for session migration/compatibility.
- Vercel for two independent deployments, both built from the `main` branch with each portal as its project root.

The supplied `Effortless.jpg` in the original workspace was used as a visual reference. The login landing recreates its dark, cinematic graduation-cap, glowing-ring, rock-pedestal, and glass-card direction in CSS rather than shipping the reference image as a production background.

> **Security:** demo credentials, local signups, browser roles, and the Supabase anon key are not security boundaries. Do not use real student data until Supabase Auth, RLS, and private Storage access policies are configured and verified.

## Section 2: Folder structure breakdown

### Repository root

```text
.
├── .github/
│   ├── CODEOWNERS                 # Default code owner (@hemmy9)
│   └── SECURITY.md                # Private security-reporting guidance and limitations
├── .gitignore                    # Excludes environment files, dependencies, and build output
├── .vscode/settings.json         # Editor setting for the archived static preview
├── LICENSE                       # Proprietary academic-use notice
├── PROJECT_BREAKDOWN.md          # This architecture and workflow guide
├── AI_HANDOVER_PROMPT.md         # Copy/paste continuation instructions
├── README.md                     # Repository overview, security warning, GitHub setup steps
├── package-lock.json             # Empty workspace-level lock; each app has its own dependency lock
├── student-portal/               # Independent student Vite app and deployment root
└── supervisor-portal/            # Independent supervisor Vite app and deployment root
```

`Effortless.jpg` was a supplied, untracked reference file in the original working directory. It is not a runtime dependency; the CSS illustration is self-contained.

### Student portal

```text
student-portal/
├── .env.example                  # Example VITE_SUPABASE_URL / anon key / bucket settings
├── .gitignore                    # Local environment, dependencies, and dist exclusions
├── index.html                    # Vite HTML shell and app title
├── package.json                  # React, Router, Supabase, LocalForage, and Vite scripts
├── package-lock.json             # Locked student app dependencies
├── vercel.json                   # SPA rewrite to index.html for deep links
├── README.md                     # Student data contract and setup/security notes
├── legacy/                       # Archived inactive static student-site source; not built
├── supabase/
│   └── setup.sql                 # Adds role/email and document-review fields; enables Realtime publication
└── src/
    ├── App.jsx                   # Student session restoration, route guards, dashboard and upload UI
    ├── main.jsx                  # React root, BrowserRouter, and stylesheet entry
    ├── styles.css                # Dark TechCool-inspired landing, auth, dashboard, and chat styling
    ├── pages/
    │   ├── Home.tsx              # CSS-illustrated landing page and feature presentation
    │   └── Login.tsx             # Login/signup modal, role choice, demo bypass and Supabase Auth login
    ├── components/
    │   └── ChatPanel.jsx         # Student conversation, Realtime updates, and local message fallback
    └── lib/
        ├── calculateProgress.js  # Computes progress from task statuses
        ├── permissions.js        # Small client-side feedback permission helper (not authorization)
        ├── storage.js            # Supabase Storage upload and cached session/localStorage bridge
        └── supabaseClient.js     # Shared URL/key fallback and Postgres Realtime helper
```

**Student dashboard behavior:** `/dashboard` shows a project progress summary, tasks, Chapter 1–5 document upload/status/review-feedback, supervisor feedback, and project chat. Dashboard data comes from `tasks`, `documents`, and `feedbacks`; sample data and a setup warning are shown when required dashboard queries fail. Upload controls are disabled while the dashboard is in sample-data fallback mode.

### Supervisor portal

```text
supervisor-portal/
├── .env.example                  # Example shared Supabase settings
├── .gitignore                    # Local environment, dependencies, and dist exclusions
├── index.html                    # Vite HTML shell and app title
├── package.json                  # React, Router, Supabase, LocalForage, and Vite scripts
├── package-lock.json             # Locked supervisor app dependencies
├── vercel.json                   # SPA rewrite to index.html for deep links
├── README.md                     # Supervisor schema and access-control notes
├── legacy/                       # Archived inactive supervisor UI/source; not built
├── supabase/
│   └── setup.sql                 # Same shared database/Realtime additions as student setup
└── src/
    ├── App.jsx                   # Supervisor session, student/project review dashboard and routes
    ├── main.jsx                  # React root, BrowserRouter, and stylesheet entry
    ├── styles.css                # Dark TechCool-inspired landing, auth, dashboard, and chat styling
    ├── pages/
    │   ├── Home.tsx              # Supervisor-oriented landing page in the shared visual theme
    │   └── Login.tsx             # Login/signup modal, role choice, demo bypass and Supabase Auth login
    ├── components/
    │   └── ChatPanel.jsx         # Selected-student conversation, Realtime updates, local fallback
    └── lib/
        ├── calculateProgress.js  # Computes progress from task statuses
        ├── permissions.js        # Client-side feedback role guard (not authorization)
        ├── storage.js            # Cached supervisor session/localStorage bridge and uploads helper
        └── supabaseClient.js     # Shared URL/key fallback and Postgres Realtime helper
```

### Routes and authentication components

Each app renders its `Home.tsx` at `/`, overlays the `Login.tsx` dialog at `/login` or `/signup`, and protects its dashboard based on the role in the cached session. Student dashboard route is `/dashboard`; supervisor dashboard route is also `/dashboard` on the separate supervisor domain, with `/supervisor-dashboard` retained as an alias. `/supervisor-login` redirects to `/login`.

There is no separate `ProtectedRoute` component in this codebase; route elements perform the role check inline. The source files are `.jsx`/`.tsx`, not `App.tsx`.

### Supabase setup and data contract

`supabase/setup.sql` is an additive setup/migration script, not a complete schema installer. It:

- Adds `email` and `role` to the pre-existing `public.students` table and sets student defaults.
- Creates `public.supervisors`.
- Adds `chapter`, `status`, `review_feedback`, `reviewed_by`, and `reviewed_at` to the pre-existing `public.documents`.
- Creates `public.messages` if absent, adds the fields used by chat to an existing messages table, and adds the chat table to the `supabase_realtime` publication.

The script assumes the existing `students`, `documents`, `tasks`, and `feedbacks` tables and their base columns already exist. It does **not** create `projects`, `tasks`, `documents`, or `feedbacks`, does not configure Auth/RLS/storage policies, and does not set up the `fyp-docs` bucket. Apply it to the shared Supabase project before enabling live review/chat; verify the actual table columns and policies in Supabase.

| Table | How the portals use it | Schema status |
| --- | --- | --- |
| `students` | Student identity/role; supervisor student list | Existing table; setup adds email/role |
| `supervisors` | Supervisor identity/role lookup | Created by setup SQL |
| `tasks` | Student task list and progress calculations | Assumed pre-existing; uses `student_id` and a task title/status |
| `documents` | Chapter uploads, storage URLs, review status and feedback | Assumed pre-existing; setup adds review columns |
| `feedbacks` | Supervisor notes displayed to students and supervisors | Assumed pre-existing; uses `student_id`, `comment`, `supervisor_id` |
| `messages` | Chat rows filtered by `student_id`, ordered by creation time | Created if absent; additive chat columns are added to an existing table |
| `projects` | Not queried or created by the current application | Not currently implemented |

### Archived files not part of the current Vite build

Student `legacy/` contains `README.md` (archive note), static page files (`ai-assistant.html`, `data-management.html`, `document.html`, `journal.html`, `login.html`, `profile.html`, `reports.html`, `settings.html`, `spt.html`, and `task.html`), shared `spt.css`, browser logic (`chat.js`, `drafts.js`, and `spt.js`), and illustrations (`public/illustrations/ai-robot.svg` and `project-progress.svg`).

Supervisor `legacy/` contains `spt.css`, `supervisor-chat.html`, `supervisor-portal.js`, `src/app.js`, `src/portal.css`, data samples in `src/data/history.js` and `src/data/students.js`, and static routes in `supervisor/index.html`, `supervisor/login/index.html`, and `supervisor/student/index.html`.

The root `.vscode/settings.json` points Live Preview at archived `/spt.html`; it does not change the Vite app entry. The empty root `package-lock.json` has no root package manifest; use the separate `package-lock.json` files inside each portal.

Both `legacy/` folders hold archived static-site sources. The Vite entries are `src/main.jsx`; the legacy HTML/JS files are not imported into either production bundle. `node_modules/` and `dist/` are generated/local directories and are excluded from Git.

## Section 3: Student workflow

1. Open the student portal and choose Login or Sign Up.
2. Use the student demo bypass (`student@test.com` / `123456`), a local demo account created on that browser, or a Supabase Auth account whose user metadata contains `role: "student"`.
3. The portal stores the session under `student_user`, then routes to `/dashboard`.
4. Review task progress and existing supervisor feedback.
5. Select a chapter (1–5), upload a document to the configured `fyp-docs` Supabase Storage bucket, and view its review status/feedback.
6. Chat with the supervisor. When the `messages` table is available, messages use Supabase Postgres Realtime. If it is not available, messages are saved to this browser's `fyp_messages` localStorage list and labeled local-only.
7. Log out to remove the `student_user` session.

**Not currently implemented:** project create/edit/delete, a calendar/deadline widget, search/filter controls, or a dedicated October 2024 calendar. Those are roadmap items rather than working screens.

## Section 4: Supervisor workflow

1. Open the supervisor portal and choose Login or Sign Up.
2. Use the supervisor demo bypass (`supervisor@test.com` / `123456`), a local demo account created on that browser, or a Supabase Auth account whose user metadata contains `role: "supervisor"`.
3. The portal stores the session under `supervisor_user`, then routes to `/dashboard`.
4. Review the student cards, task progress, documents and statuses.
5. Enter per-document feedback and approve or reject the selected submission.
6. Select a student in the feedback form to open the corresponding project chat. Chat uses Supabase Realtime when available and falls back to browser-local messages otherwise.
7. Log out to remove the `supervisor_user` session.

**Not currently implemented:** grading/rubrics, bulk approval, project assignment CRUD, advanced search/filter, or a calendar widget.

## Section 5: Feature list and implementation status

### Student features

| Feature | Status |
| --- | --- |
| Student demo bypass | Implemented for the listed demo email/password |
| Signup | Implemented as browser-local demo signup; not a Supabase Auth registration |
| Supabase Auth password login | Implemented when the Auth account metadata role matches `student` |
| Project/task progress summary | Implemented from existing task records |
| Chapter 1–5 document upload | Implemented with Supabase Storage and `documents` insert |
| Document status and supervisor feedback | Implemented |
| Realtime student data refresh | Implemented for configured tables |
| Supervisor chat and `fyp_messages` fallback | Implemented |
| Calendar, CRUD, search/filter, fixed 128/42/86/94% sample metrics | Not implemented; artwork reference only |
| Dark TechCool-inspired visual theme | Implemented as responsive CSS illustration/glass UI; not a WebGL/3D render |

### Supervisor features

| Feature | Status |
| --- | --- |
| Supervisor demo bypass | Implemented for the listed demo email/password |
| Signup | Implemented as browser-local demo signup; not a Supabase Auth registration |
| Supabase Auth password login | Implemented when the Auth account metadata role matches `supervisor` |
| Student/task/document list | Implemented against the existing shared tables |
| Document approve/reject with feedback | Implemented |
| Supervisor feedback | Implemented |
| Student chat and Realtime | Implemented when the database table/publication is configured |
| `fyp_messages` local fallback | Implemented for local-only/offline use |
| Grading, bulk approval, search/filter, calendar, project CRUD | Not implemented |

## Section 6: Authentication and chat flow

```text
Student portal                               Supervisor portal
Home → Login/Sign Up → role=student          Home → Login/Sign Up → role=supervisor
          │                                             │
          ├─ demo bypass / local demo signup            ├─ demo bypass / local demo signup
          └─ Supabase Auth password login               └─ Supabase Auth password login
                    │                                             │
            localStorage student_user                    localStorage supervisor_user
                    │                                             │
             /dashboard (student)                            /dashboard (supervisor)
                    └────────── shared Supabase project ─────────┘
                                       │
                       messages table + Postgres Realtime
                                       │ if unavailable
                         localStorage fyp_messages
```

- `student_user` and `supervisor_user` are distinct, portal-specific session keys. The previous `e2381a1` change fixed the missing React runtime import that caused blank rendering; these named keys are the current session contract and are not cross-role interchangeable.
- `fyp_users` stores local-only demo signups on the current origin. Passwords are stored as SHA-256 digests for demo convenience, not as a production credential store. Browser storage can be read or modified by the user.
- `fyp_messages` stores local-only fallback messages. LocalStorage is origin-scoped, so local fallback messages do **not** synchronize between the two different Vercel domains. Shared student/supervisor chat requires the configured Supabase table and realtime publication.
- Supabase Auth login checks the authenticated user's `user_metadata.role`. The Sign Up screen currently creates a browser-local demo account, not a Supabase Auth user.
- Browser-side role checks improve navigation UX only. Supabase RLS and storage policies must enforce real access control.

## Section 7: Deployment and operations

Both Vercel projects deploy from GitHub `main`, with separate project roots:

1. `student-portal/` → student production domain.
2. `supervisor-portal/` → supervisor production domain.

Each portal includes a `vercel.json` SPA rewrite to `/index.html`, so direct navigation to client routes works. Set the same environment variables in **both** Vercel projects:

- `VITE_SUPABASE_URL` — shared Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — public publishable/anon key (never a service-role key).
- `VITE_STORAGE_BUCKET` — optional bucket name; defaults to `fyp-docs`.

The Supabase URL and publishable key are also documented in each ignored-by-default `.env.example` for local setup. `.env` files must not be committed. Run `npm install` and `npm run build` from each portal root. Run the applicable `supabase/setup.sql` once in the shared Supabase SQL Editor after confirming its expected existing tables.

Repository privacy is not enabled by code. The owner must make the repository private and configure GitHub branch protection using the steps in the root `README.md`.
