> ⚠️ **PROPRIETARY - DO NOT COPY** - This code is a private FYP project. Unauthorized copying will be reported via GitHub DMCA.

# Student Project Tracker portals

This workspace contains two independent applications:

- [`student-portal/`](./student-portal/): student-only login and dashboard.
- [`supervisor-portal/`](./supervisor-portal/): supervisor-only login and dashboard.

See [`PROJECT_BREAKDOWN.md`](./PROJECT_BREAKDOWN.md) for the current architecture, data contract, workflows, and implemented-vs-planned feature status. [`AI_HANDOVER_PROMPT.md`](./AI_HANDOVER_PROMPT.md) contains continuation context for a future maintainer.

Run `npm install` and `npm run build` independently from each application folder. The former static student site is retained in `student-portal/legacy/` as an inactive source archive; it is not included in either app build. Old supervisor-only pages are retained in `supervisor-portal/legacy/`.

Both apps include built-in demo credentials, browser-local demo signups, and Supabase Auth password login for accounts with matching role metadata. Demo signup/session checks are intentionally not secure authentication. Do not use real student data until Supabase Auth and server-enforced RLS/storage policies are configured and verified.

## Repository protection

The repository owner must make the repository private in GitHub; this change cannot be performed from this workspace:

1. Open **Settings → General → Change repository visibility → Make private** and confirm.
2. Under **Settings → Branches**, add a branch protection rule for `main`. Require a pull request before merging, restrict deletions, and include administrators.
3. Under **Settings → General → Features**, turn off **Allow forking** if that option is available for this account/repository. Fork controls vary by account type and visibility. Under **Settings → Actions → General**, restrict permitted actions to the minimum required.
4. Review collaborators, deploy keys, GitHub Apps, and Vercel's repository access after changing visibility. Confirm Vercel can still read the private repository and deploy.

The repository also contains a proprietary `LICENSE`, `.github/CODEOWNERS`, and `.github/SECURITY.md`. These notices do not prevent copying by themselves; private visibility and access controls must be set in GitHub.

Local `.env` files are ignored; only `.env.example` files are intended to be tracked. The Supabase anon/publishable key is public by design and must be constrained with RLS. Never commit a service-role key.
