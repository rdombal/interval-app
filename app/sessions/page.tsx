import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser, getRecentSessions } from "@/lib/queries";
import { fmtClock } from "@/lib/types";

export default async function SessionsPage() {
  const [user, sessions] = await Promise.all([
    getCurrentUser(),
    getRecentSessions(50),
  ]);

  return (
    <AppShell name={user?.name}>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Your sessions</h1>
      <p className="mb-5 text-neutral-500">Every workout you&apos;ve run.</p>

      {sessions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="font-semibold text-neutral-700">No sessions yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Run a workout and it&apos;ll show up here.
          </p>
          <Link
            href="/browse"
            className="mt-5 inline-block rounded-2xl bg-mint-500 px-5 py-3 text-sm font-bold text-white hover:bg-mint-600"
          >
            Find a workout
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3.5"
            >
              <div>
                <p className="font-semibold text-neutral-900">{s.workout_name}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(s.completed_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {s.finished ? "Completed" : "Ended early"}
                  {" · "}
                  {s.phases_completed} phases
                </p>
              </div>
              <span className="tabular text-sm font-bold text-neutral-700">
                {fmtClock(s.total_seconds)}
              </span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
