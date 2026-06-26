-- ============================================================
-- Interval Training App — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Re-runnable: guarded with IF EXISTS / IF NOT EXISTS.
-- ============================================================

-- ---------- Enums ----------
do $$ begin
  create type phase_type as enum ('warmup','work','rest','recovery','cooldown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type intensity_level as enum ('low','moderate','high','max');
exception when duplicate_object then null; end $$;

do $$ begin
  create type skill_level as enum ('beginner','intermediate','advanced');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- workouts ----------
create table if not exists workouts (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references auth.users(id) on delete cascade, -- null = curated library
  name             text not null,
  description      text default '',
  sport            text default 'general',
  goal             text default 'conditioning',
  intensity        intensity_level not null default 'moderate',
  level            skill_level not null default 'beginner',
  location         text default 'anywhere',          -- home | gym | outdoor | anywhere
  equipment        text[] not null default '{}',
  training_effects text[] not null default '{}',     -- endurance, speed, fat_loss, vo2max, recovery...
  tags             text[] not null default '{}',
  coach            text default '',
  is_public        boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists workouts_owner_idx  on workouts(owner_id);
create index if not exists workouts_public_idx on workouts(is_public);

-- ---------- workout_blocks ----------
-- Ordered blocks. Blocks sharing a round_group repeat together `rounds` times,
-- which expands cleanly into Tabata / interval / ladder / pyramid timelines.
create table if not exists workout_blocks (
  id               uuid primary key default gen_random_uuid(),
  workout_id       uuid not null references workouts(id) on delete cascade,
  position         int  not null,
  type             phase_type not null,
  name             text not null,
  duration_seconds int  not null check (duration_seconds > 0),
  round_group      uuid,
  rounds           int  not null default 1 check (rounds >= 1)
);
create index if not exists blocks_workout_idx on workout_blocks(workout_id, position);

-- ---------- saved_workouts (favorites) ----------
create table if not exists saved_workouts (
  user_id    uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references workouts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, workout_id)
);

-- ---------- completed_sessions ----------
create table if not exists completed_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  workout_id       uuid references workouts(id) on delete set null,
  workout_name     text not null,
  started_at       timestamptz not null default now(),
  completed_at     timestamptz not null default now(),
  total_seconds    int not null default 0,
  phases_completed int not null default 0,
  finished         boolean not null default false
);
create index if not exists sessions_user_idx on completed_sessions(user_id, completed_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles           enable row level security;
alter table workouts           enable row level security;
alter table workout_blocks     enable row level security;
alter table saved_workouts     enable row level security;
alter table completed_sessions enable row level security;

drop policy if exists "profiles self read"   on profiles;
create policy "profiles self read"   on profiles for select using (auth.uid() = id);
drop policy if exists "profiles self insert" on profiles;
create policy "profiles self insert" on profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update using (auth.uid() = id);

drop policy if exists "workouts read"       on workouts;
create policy "workouts read"       on workouts for select using (is_public or owner_id = auth.uid());
drop policy if exists "workouts insert own" on workouts;
create policy "workouts insert own" on workouts for insert with check (owner_id = auth.uid());
drop policy if exists "workouts update own" on workouts;
create policy "workouts update own" on workouts for update using (owner_id = auth.uid());
drop policy if exists "workouts delete own" on workouts;
create policy "workouts delete own" on workouts for delete using (owner_id = auth.uid());

drop policy if exists "blocks read"  on workout_blocks;
create policy "blocks read"  on workout_blocks for select using (
  exists (select 1 from workouts w where w.id = workout_id
          and (w.is_public or w.owner_id = auth.uid()))
);
drop policy if exists "blocks write" on workout_blocks;
create policy "blocks write" on workout_blocks for all using (
  exists (select 1 from workouts w where w.id = workout_id and w.owner_id = auth.uid())
) with check (
  exists (select 1 from workouts w where w.id = workout_id and w.owner_id = auth.uid())
);

drop policy if exists "saved own" on saved_workouts;
create policy "saved own" on saved_workouts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "sessions own" on completed_sessions;
create policy "sessions own" on completed_sessions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
