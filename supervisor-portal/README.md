# Supervisor Portal

Independent Vite/React app for supervisor-only sign-in, student progress, and feedback.

## Local development

1. Copy `.env.example` to `.env` and set the Supabase URL, publishable anon key, and bucket name.
2. Run `npm install`, then `npm run dev`.
3. Run `npm run build` to create `dist/`.

## Data contract and access control

The built-in demo login is `supervisor@test.com` / `123456`. Local signup accounts are stored in browser localStorage for demo use. Other password logins use Supabase Auth and require `user_metadata.role = 'supervisor'`. Student, task, and feedback records are expected to use `students.id`, `tasks.student_id`, `feedbacks.student_id`, `feedbacks.supervisor_id`, and `feedbacks.comment`. Document review uses `documents.chapter`, `documents.status`, `documents.review_feedback`, `documents.reviewed_by`, and `documents.reviewed_at`.

Built-in demo accounts, local signup accounts, and `permissions.js` are browser-side UX, not authorization. They can be bypassed by a caller using the public anon key. Configure Supabase Auth, RLS policies, and private storage policies before handling real student data. Local signup does not create a Supabase Auth account.

Run `supabase/setup.sql` in the shared Supabase project's SQL Editor before using document reviews and realtime updates. It adds the student role/email fields, creates the supervisors and messages tables when absent, adds chapter/status/review fields to `documents`, and enables Realtime publication. It assumes the base student, task, document, and feedback tables already exist and does not enable RLS or create passwords. Ensure the related tables include `student_id` values matching `students.id`.
