# Student Project Tracker portals

This workspace contains two independent applications:

- [`student-portal/`](./student-portal/): student-only login and dashboard.
- [`supervisor-portal/`](./supervisor-portal/): supervisor-only login and dashboard.

Run `npm install` and `npm run build` independently from each application folder. The former static student site is retained in `student-portal/legacy/` as an inactive source archive; it is not included in either app build. Old supervisor-only pages are retained in `supervisor-portal/legacy/`.

Both apps currently use intentionally non-secure email-only demo sign-in. Do not use real student data until Supabase Auth and server-enforced RLS/storage policies replace the demo checks.
