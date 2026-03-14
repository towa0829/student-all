create extension if not exists "pgcrypto";

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  period smallint not null check (period between 1 and 8),
  room text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  memo text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  hourly_wage integer not null check (hourly_wage >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists classes_user_id_idx on public.classes (user_id);
create index if not exists assignments_user_id_idx on public.assignments (user_id);
create index if not exists assignments_due_date_idx on public.assignments (due_date);
create index if not exists shifts_user_id_idx on public.shifts (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);

alter table public.classes enable row level security;
alter table public.assignments enable row level security;
alter table public.shifts enable row level security;
alter table public.tasks enable row level security;

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
