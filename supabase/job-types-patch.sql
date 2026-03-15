create extension if not exists "pgcrypto";

create table if not exists public.job_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  hourly_wage integer not null check (hourly_wage >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.job_types enable row level security;

alter table public.shifts add column if not exists job_type_id uuid;

create index if not exists job_types_user_id_idx on public.job_types (user_id);
create index if not exists shifts_job_type_id_idx on public.shifts (job_type_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shifts_job_type_id_fkey'
  ) THEN
    ALTER TABLE public.shifts
      ADD CONSTRAINT shifts_job_type_id_fkey
      FOREIGN KEY (job_type_id) REFERENCES public.job_types(id) ON DELETE SET NULL;
  END IF;
END $$;

drop policy if exists "job_types_select_own" on public.job_types;
create policy "job_types_select_own" on public.job_types
  for select using (auth.uid() = user_id);

drop policy if exists "job_types_insert_own" on public.job_types;
create policy "job_types_insert_own" on public.job_types
  for insert with check (auth.uid() = user_id);

drop policy if exists "job_types_update_own" on public.job_types;
create policy "job_types_update_own" on public.job_types
  for update using (auth.uid() = user_id);

drop policy if exists "job_types_delete_own" on public.job_types;
create policy "job_types_delete_own" on public.job_types
  for delete using (auth.uid() = user_id);
