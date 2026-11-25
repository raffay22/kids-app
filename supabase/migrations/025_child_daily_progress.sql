-- =============================================================================
-- 025_child_daily_progress.sql
-- Lightweight 30-day rolling daily summary table per child.
-- Keeps database load negligible via 1 row per (child_id, date) upsert.
-- =============================================================================

create table if not exists public.child_daily_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  date date not null default current_date,
  stars_earned integer not null default 0 check (stars_earned >= 0),
  activities_completed integer not null default 0 check (activities_completed >= 0),
  trophies_earned integer not null default 0 check (trophies_earned >= 0),
  updated_at timestamptz not null default now(),
  constraint child_daily_progress_child_date_unique unique (child_id, date)
);

create index if not exists idx_child_daily_progress_child_date
  on public.child_daily_progress (child_id, date desc);

alter table public.child_daily_progress enable row level security;

drop policy if exists "Parents read own child daily progress" on public.child_daily_progress;
create policy "Parents read own child daily progress"
  on public.child_daily_progress
  for select
  using (
    date >= current_date - interval '30 days'
    and exists (
      select 1
      from public.children c
      where c.id = child_daily_progress.child_id
        and c.parent_user_id = auth.uid()
    )
  );

drop policy if exists "Parents insert own child daily progress" on public.child_daily_progress;
create policy "Parents insert own child daily progress"
  on public.child_daily_progress
  for insert
  with check (
    exists (
      select 1
      from public.children c
      where c.id = child_daily_progress.child_id
        and c.parent_user_id = auth.uid()
    )
  );

drop policy if exists "Parents update own child daily progress" on public.child_daily_progress;
create policy "Parents update own child daily progress"
  on public.child_daily_progress
  for update
  using (
    exists (
      select 1
      from public.children c
      where c.id = child_daily_progress.child_id
        and c.parent_user_id = auth.uid()
    )
  );

-- Optional lightweight housekeeping helper to prune rows older than 30 days
create or replace function public.prune_old_child_daily_progress()
returns void
language sql
security definer
as $$
  delete from public.child_daily_progress
  where date < current_date - interval '30 days';
$$;
