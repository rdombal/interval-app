# Interval — build & run interval workouts

A mobile-first web app for planning, saving, browsing, and running interval
training sessions. Build a warmup, work/rest intervals, rounds, and a cooldown
in under a minute, then run a big, calm, motivating timer that guides you
through every phase — no fighting with a watch interface.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Supabase**, and
ready to deploy on **Vercel**.

## What's inside

- **Auth** — email/password sign up & log in via Supabase Auth.
- **Dashboard** — quick actions, recent sessions, a peek at the library.
- **Browse** — searchable, filterable library (duration, intensity, level,
  sport, training effect, location).
- **Workout detail** — overview, facts grid, full phase-by-phase timeline,
  Start and Save.
- **Guided builder** — a 3-step wizard (start from a preset, shape the
  intervals, add details) with a live timeline preview. Never feels like a form.
- **Live runner** — full-screen immersive timer: giant countdown, phase-colour
  background, depleting ring, next-up preview, round counter, audio + haptic
  cues, pause/resume, skip, end, keep-awake, and a completion summary.
- **Saved collection** and **session history**, both tied to the signed-in user.

The signature visual element is the **proportional segmented timeline bar** —
each phase is a colour-coded segment sized by its duration. It recurs on cards,
the detail page, the builder preview, and the runner's progress strip.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com), create a project. Then in the
**SQL Editor**, run the two files in `supabase/` in order:

1. `supabase/schema.sql` — tables, enums, the auto-profile trigger, and Row
   Level Security policies.
2. `supabase/seed.sql` — six curated public library workouts.

> Auth note: in **Authentication → Providers → Email**, you can turn off
> "Confirm email" for the fastest local testing, or leave it on — the included
> `/auth/callback` route handles the confirmation link.

### 3. Environment variables

Copy the example and fill in your project values (Project Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
4. Deploy. In Supabase **Authentication → URL Configuration**, add your Vercel
   URL to the allowed redirect URLs (e.g. `https://your-app.vercel.app/auth/callback`).

## Data model

| Table                | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `profiles`           | One row per user (auto-created on signup).                     |
| `workouts`           | Library (public, `owner_id` null) or private user creations.   |
| `workout_blocks`     | Ordered blocks; blocks sharing a `round_group` repeat `rounds` times. |
| `saved_workouts`     | A user's favourites.                                           |
| `completed_sessions` | A log of finished or ended runs.                               |

Blocks sharing a `round_group` expand cleanly into Tabata, interval, ladder, and
pyramid timelines via `expandTimeline()` in `lib/types.ts` — the single source
of truth used by the runner, previews, and builder. RLS ensures users only see
public workouts plus their own, and can only mutate their own data.

## Project structure

```
app/
  page.tsx              Landing
  login/                Auth (sign in / sign up + server actions)
  auth/callback/        Email-confirmation handler
  dashboard/            Home after login
  browse/               Library + filters
  workouts/[id]/        Workout detail + preview
  create/               Guided builder
  run/[id]/             Live runner
  saved/                Favourites
  sessions/             Session history
  actions.ts            Server actions (save, create, log session, sign out)
components/              Shell, nav, cards, timeline, save button, runner, builder
lib/
  types.ts              Domain types, timeline expansion, formatting, phase styles
  queries.ts            Server-side data access
  supabase/             Browser / server / middleware clients
supabase/
  schema.sql            Schema + RLS
  seed.sql              Curated library
```

## Extending the builder

The first version creates the common shape (warmup → repeated work/rest →
cooldown). Because workouts are modelled as ordered blocks with round groups,
the builder can grow to support multiple blocks, ladders, pyramids, and
sport-specific sessions without any schema change — add more `BuilderBlock`s and
group ids in `app/actions.ts`.
