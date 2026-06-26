import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { WorkoutCard } from "@/components/WorkoutCard";
import {
  getCurrentUser,
  getVisibleWorkouts,
  getRecentSessions,
} from "@/lib/queries";
import { fmtClock } from "@/lib/types";

export default async function Dashboard() {
  const [user, workouts, sessions] = await Promise.all([
    getCurrentUser(),
    getVisibleWorkouts(),
    getRecentSessions(4),
  ]);

  const library = workouts.filter((w) => w.is_public).slice(0, 4);

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
          className="group flex items-center justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-card transition hover:border-mint-200"
        >
          <div>
            <p className="text-lg font-bold text-neutral-900">Start a workout</p>
            <p className="text-sm text-neutral-500">Browse the library & press play</p>
          </div>
          <span className="text-2xl text-mint-500 transition group-hover:translate-x-1">▶</span>
        </Link>
      </div>

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
                className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3"
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
