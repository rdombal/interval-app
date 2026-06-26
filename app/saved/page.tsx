import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { WorkoutCard } from "@/components/WorkoutCard";
import { getCurrentUser, getSavedWorkouts } from "@/lib/queries";

export default async function SavedPage() {
  const [user, saved] = await Promise.all([
    getCurrentUser(),
    getSavedWorkouts(),
  ]);

  return (
    <AppShell name={user?.name}>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Saved</h1>
      <p className="mb-5 text-neutral-500">
        Your favourites and the workouts you&apos;ve built.
      </p>

      {saved.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="font-semibold text-neutral-700">Nothing saved yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Tap the heart on any workout, or build your own.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/browse"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-700 hover:border-neutral-300"
            >
              Browse library
            </Link>
            <Link
              href="/create"
              className="rounded-2xl bg-mint-500 px-5 py-3 text-sm font-bold text-white hover:bg-mint-600"
            >
              Create a workout
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
