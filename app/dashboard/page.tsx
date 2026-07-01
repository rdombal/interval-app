import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { WorkoutCard } from "@/components/WorkoutCard";
import {
  getCurrentUser,
  getProfile,
  getVisibleWorkouts,
  getRecentSessions,
} from "@/lib/queries";
import { fmtClock, hasTrainingPrefs, recommendWorkouts } from "@/lib/types";

export default async function Dashboard() {
  const [user, profile, workouts, sessions] = await Promise.all([
    getCurrentUser(),
    getProfile(),
    getVisibleWorkouts(),
    getRecentSessions(4),
  ]);

  const library = workouts.filter((w) => w.is_public).slice(0, 4);
  const recommended = recommendWorkouts(profile, workouts, 3);
  const hasPrefs = hasTrainingPrefs(profile);
  const focus = profile.training_for || profile.primary_goal?.replace("_", " ");

  return (
    <AppShell name={user?.name}>
      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
        Ready to move{user?.name ? `, ${user.name}` : ""}?
      </h1>
      <p className="mt-1 text-neutral-500">What do you want to do today?</p>

      {/* Primary actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/create"
          className="group flex items-center justify-between rounded-3xl bg-mint-500 p-6 text-white shadow-card transition hover:bg-mint-600"
        >
          <div>
            <p className="text-lg font-bold">Create a workout</p>
            <p className="text-sm text-mint-50/90">Guided builder · under a minute</p>
          </div>
          <span className="text-2xl transition group-hover:translate-x-1">＋</span>
        </Link>
        <Link
          href="/browse"
          className="group flex items-center justify-between rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card transition hover:border-mint-200"
        >
          <div>
            <p className="text-lg font-bold text-neutral-900">Start a workout</p>
            <p className="text-sm text-neutral-500">Browse the library & press play</p>
          </div>
          <span className="text-2xl text-mint-500 transition group-hover:translate-x-1">▶</span>
        </Link>
      </div>

      {/* Recommendations — or a nudge to set up the profile */}
      {hasPrefs && recommended.length > 0 ? (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
              Recommended for you
            </h2>
            <Link href="/profile" className="text-sm font-semibold text-mint-600">
              Edit profile
            </Link>
          </div>
          {focus && (
            <p className="mb-3 -mt-1 text-sm text-neutral-500">
              Because you&apos;re training for {focus}.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        </section>
      ) : (
        <Link
          href="/profile"
          className="group mt-8 flex items-center justify-between rounded-3xl border border-dashed border-mint-300 bg-mint-50/60 p-5 transition hover:bg-mint-50"
        >
          <div>
            <p className="font-bold text-neutral-900">Set up your training profile</p>
            <p className="text-sm text-neutral-500">
              Tell us what you&apos;re training for and we&apos;ll recommend sessions.
            </p>
          </div>
          <span className="text-xl text-mint-600 transition group-hover:translate-x-1">→</span>
        </Link>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-400">
            Recent sessions
          </h2>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-neutral-900">{s.workout_name}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(s.completed_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {s.finished ? "Completed" : "Ended early"}
                  </p>
                </div>
                <span className="tabular text-sm font-semibold text-neutral-700">
                  {fmtClock(s.total_seconds)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Library peek */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
            From the library
          </h2>
          <Link href="/browse" className="text-sm font-semibold text-mint-600">
            See all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {library.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
