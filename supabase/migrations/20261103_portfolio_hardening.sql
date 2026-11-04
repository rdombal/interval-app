-- ============================================================
-- Portfolio hardening. Run once in the Supabase SQL Editor.
-- Safe to re-run.
-- ============================================================

-- 1) Profile fields used by /profile and dashboard recommendations.
--    These already exist in production; this makes a fresh setup match.
alter table profiles add column if not exists training_for  text;
alter table profiles add column if not exists primary_goal  text;
alter table profiles add column if not exists primary_sport text;
alter table profiles add column if not exists level         text;
alter table profiles add column if not exists updated_at    timestamptz not null default now();

-- 2) Only the curated library (owner_id is null) can be public.
--    Before this, any signed-in user could call the API directly with
--    is_public = true and their workout would appear in everyone's library.
drop policy if exists "workouts insert own" on workouts;
create policy "workouts insert own" on workouts for insert
  with check (owner_id = auth.uid() and is_public = false);

drop policy if exists "workouts update own" on workouts;
create policy "workouts update own" on workouts for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and is_public = false);

-- 3) Check: this should return no rows. If it returns any, a user has
--    already published into the library; review them before deleting.
select id, name, owner_id, created_at
from workouts
where is_public and owner_id is not null;
