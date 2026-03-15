-- schedules テーブルを追加するパッチ
-- Supabase の SQL Editor に貼り付けて実行してください

create table if not exists public.schedules (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  start_at    text not null,  -- format: "YYYY-MM-DDTHH:MM"
  end_at      text not null,  -- format: "YYYY-MM-DDTHH:MM"
  memo        text,
  created_at  timestamptz not null default now()
);

create index if not exists schedules_user_id_idx on public.schedules(user_id);
create index if not exists schedules_start_at_idx on public.schedules(start_at);

alter table public.schedules enable row level security;

create policy "schedules: users can select own rows"
  on public.schedules for select
  using (auth.uid() = user_id);

create policy "schedules: users can insert own rows"
  on public.schedules for insert
  with check (auth.uid() = user_id);

create policy "schedules: users can update own rows"
  on public.schedules for update
  using (auth.uid() = user_id);

create policy "schedules: users can delete own rows"
  on public.schedules for delete
  using (auth.uid() = user_id);
