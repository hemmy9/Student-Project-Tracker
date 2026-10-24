# Student Portal

Independent Vite/React app for student-only sign-in and project tracking.

## Local development

1. Copy `.env.example` to `.env` and set the Supabase URL, publishable anon key, and bucket name.
2. Run `npm install`, then `npm run dev`.
3. Run `npm run build` to create `dist/`.

## Data contract

The demo login looks up one `students` row by `email` and requires `role = 'student'`. It does not ask for or store a password. The app expects `tasks`, `documents`, `feedbacks`, and `messages` to contain a `student_id` column matching `students.id`. Uploads create a document row with `student_id`, `chapter` (1–5), `title`, `filename`, `file_url`, `file_path`, and a `pending` status. Students can see the supervisor's review status and document feedback.

The browser-cached session, email lookup, and role checks are only demo UX, not authentication or authorization. Anyone with the public anon key can spoof a browser session. Do not use real student data until Supabase Auth and server-enforced row/storage policies are configured. Making the `fyp-docs` bucket public exposes uploaded files to anyone with their URLs.

Run `supabase/setup.sql` in the shared Supabase project's SQL Editor before using uploads, reviews, and realtime updates. It adds the student role/email fields, creates the email-only demo supervisors table, adds chapter/status/review fields to `documents`, and adds the existing data tables to Supabase Realtime. It does not enable RLS or create passwords. Ensure the related tables include `student_id` with the same identifier values as `students.id`.
