create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text,
  company text,
  service text not null,
  budget text,
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed'))
);

alter table public.project_requests enable row level security;

create policy "Anyone can submit project requests"
on public.project_requests
for insert
to anon, authenticated
with check (
  char_length(name) between 2 and 120
  and char_length(email) between 5 and 254
  and char_length(message) between 10 and 5000
  and status = 'new'
);

create index if not exists project_requests_created_at_idx on public.project_requests (created_at desc);
create index if not exists project_requests_status_idx on public.project_requests (status);
