# Supervisor Portal

Independent Vite/React app for supervisor-only sign-in, student progress, and feedback.

## Local development

1. Copy `.env.example` to `.env` and set the Supabase URL, publishable anon key, and bucket name.
2. Run `npm install`, then `npm run dev`.
3. Run `npm run build` to create `dist/`.

## Data contract and access control

The demo login looks up one `supervisors` row by `email` and requires `role = 'supervisor'`. Student, task, and feedback records are expected to use `students.id`, `tasks.student_id`, `feedbacks.student_id`, `feedbacks.supervisor_id`, and `feedbacks.comment`. Document review uses `documents.chapter`, `documents.status`, `documents.review_feedback`, `documents.reviewed_by`, and `documents.reviewed_at`.

Email lookup and `permissions.js` are browser-side demo checks only. They do not authenticate users and can be bypassed by a caller using the public anon key. Configure Supabase Auth, RLS policies, and private storage policies before handling real student data. Do not store passwords in these tables.

Run `supabase/setup.sql` in the shared Supabase project's SQL Editor before using document reviews and realtime updates. It adds the student role/email fields, creates the email-only demo supervisors table, adds chapter/status/review fields to `documents`, and adds the existing data tables to Supabase Realtime. It does not enable RLS or create passwords. Ensure the task and feedback tables include `student_id` values matching `students.id`.
