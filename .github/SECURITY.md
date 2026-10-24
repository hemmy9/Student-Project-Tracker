# Security policy

## Reporting a concern

This is a proprietary academic project. Please report suspected vulnerabilities or accidental exposure privately to the repository owner, [@hemmy9](https://github.com/hemmy9), using GitHub's private contact/message options. Do not publish exploit details, student information, credentials, or other sensitive data in a public issue.

## Security limitations

The demo accounts, local signups, browser-cached roles, public Supabase anon key, and client-side checks are for demonstration only. They are not an authorization boundary. Before using real student data, configure Supabase Auth, row-level security, private storage policies, and server-side role checks. Never place a Supabase service-role key or other secret in a `VITE_*` variable.
