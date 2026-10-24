# Student Portal

Independent Vite/React app for student-only sign-in and project tracking.

## Local development

1. Copy `.env.example` to `.env` and set the Supabase URL, publishable anon key, and bucket name.
2. Run `npm install`, then `npm run dev`.
3. Run `npm run build` to create `dist/`.

## Data contract

The built-in demo login is `student@test.com` / `123456`. Local signup accounts are stored in browser localStorage for demo use. Other password logins use Supabase Auth and require `user_metadata.role = 'student'`. The dashboard expects `tasks`, `documents`, `feedbacks`, and `messages` to contain a `student_id` matching the student record id. Uploads create a document row with `student_id`, `chapter` (1–5), `title`, `filename`, `file_url`, `file_path`, and a `pending` status. Students can see review status/feedback and use project chat.

The built-in demo, browser-local signups, and browser role checks are only demo UX, not authorization. Anyone can modify browser storage. Do not use real student data until Supabase Auth and server-enforced row/storage policies are configured. Making the `fyp-docs` bucket public exposes uploaded files to anyone with their URLs. Local signup does not create a Supabase Auth account.

Run `supabase/setup.sql` in the shared Supabase project's SQL Editor before using uploads, reviews, and realtime updates. It adds the student role/email fields, creates the supervisors and messages tables when absent, adds chapter/status/review fields to `documents`, and enables Realtime publication for the relevant tables. It does not create base `documents`, `tasks`, or `feedbacks` tables, enable RLS, or create passwords. Ensure the related tables include matching `student_id` values.
