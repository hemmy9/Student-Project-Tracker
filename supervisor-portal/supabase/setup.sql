alter table public.students
  add column if not exists email text,
  add column if not exists role text not null default 'student';

alter table public.students alter column role set default 'student';
update public.students set role = 'student' where role is null;
alter table public.students alter column role set not null;

create table if not exists public.supervisors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'supervisor'
    check (role = 'supervisor')
);

alter table public.documents
  add column if not exists chapter integer check (chapter between 1 and 5),
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists review_feedback text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['students', 'documents', 'tasks', 'feedbacks', 'messages'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;
