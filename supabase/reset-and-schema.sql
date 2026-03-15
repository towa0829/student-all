-- WARNING: This script deletes all data in public schema.
-- Run in Supabase SQL Editor only when you want full reset.

begin;

-- 1) Reset public schema

drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables to postgres, service_role;
alter default privileges in schema public
  grant all on functions to postgres, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, service_role;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- 2) Extensions

create extension if not exists pgcrypto;

-- 3) Tables

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  period smallint not null check (period between 1 and 8),
  room text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  memo text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.job_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  hourly_wage integer not null check (hourly_wage >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_type_id uuid references public.job_types(id) on delete set null,
  date date not null,
  start_time time not null,
  end_time time not null,
  hourly_wage integer not null check (hourly_wage >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_at text not null,
  end_at text not null,
  memo text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 4) Indexes

create index classes_user_id_idx on public.classes (user_id);
create index assignments_user_id_idx on public.assignments (user_id);
create index assignments_due_date_idx on public.assignments (due_date);
create index job_types_user_id_idx on public.job_types (user_id);
create index shifts_user_id_idx on public.shifts (user_id);
create index shifts_job_type_id_idx on public.shifts (job_type_id);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_due_date_idx on public.tasks (due_date);
create index schedules_user_id_idx on public.schedules (user_id);
create index schedules_start_at_idx on public.schedules (start_at);

-- Supabase client roles need explicit table privileges after schema reset
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;

-- 5) RLS

alter table public.classes enable row level security;
alter table public.assignments enable row level security;
alter table public.job_types enable row level security;
alter table public.shifts enable row level security;
alter table public.tasks enable row level security;
alter table public.schedules enable row level security;

create policy "classes_select_own" on public.classes
  for select using (auth.uid() = user_id);
create policy "classes_insert_own" on public.classes
  for insert with check (auth.uid() = user_id);
create policy "classes_update_own" on public.classes
  for update using (auth.uid() = user_id);
create policy "classes_delete_own" on public.classes
  for delete using (auth.uid() = user_id);

create policy "assignments_select_own" on public.assignments
  for select using (auth.uid() = user_id);
create policy "assignments_insert_own" on public.assignments
  for insert with check (auth.uid() = user_id);
create policy "assignments_update_own" on public.assignments
  for update using (auth.uid() = user_id);
create policy "assignments_delete_own" on public.assignments
  for delete using (auth.uid() = user_id);

create policy "job_types_select_own" on public.job_types
  for select using (auth.uid() = user_id);
create policy "job_types_insert_own" on public.job_types
  for insert with check (auth.uid() = user_id);
create policy "job_types_update_own" on public.job_types
  for update using (auth.uid() = user_id);
create policy "job_types_delete_own" on public.job_types
  for delete using (auth.uid() = user_id);

create policy "shifts_select_own" on public.shifts
  for select using (auth.uid() = user_id);
create policy "shifts_insert_own" on public.shifts
  for insert with check (auth.uid() = user_id);
create policy "shifts_update_own" on public.shifts
  for update using (auth.uid() = user_id);
create policy "shifts_delete_own" on public.shifts
  for delete using (auth.uid() = user_id);

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

create policy "schedules_select_own" on public.schedules
  for select using (auth.uid() = user_id);
create policy "schedules_insert_own" on public.schedules
  for insert with check (auth.uid() = user_id);
create policy "schedules_update_own" on public.schedules
  for update using (auth.uid() = user_id);
create policy "schedules_delete_own" on public.schedules
  for delete using (auth.uid() = user_id);

commit;
