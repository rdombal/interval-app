import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SaveButton } from "@/components/SaveButton";
import { TimelinePreview, IntensityBadge, Badge } from "@/components/WorkoutCard";
import { getCurrentUser, getWorkout, getSavedIds } from "@/lib/queries";
import {
  expandTimeline,
  totalSeconds,
  fmtClock,
  fmtDuration,
  PHASE_STYLES,
} from "@/lib/types";

export default async function WorkoutDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, workout, savedIds] = await Promise.all([
    getCurrentUser(),
    getWorkout(id),
    getSavedIds(),
  ]);
  if (!workout) notFound();

  const blocks = workout.workout_blocks ?? [];
  const phases = expandTimeline(blocks);
  const total = totalSeconds(blocks);
  const workCount = phases.filter((p) => p.type === "work").length;

  const facts: [string, string][] = [
    ["Total time", fmtDuration(total)],
    ["Intervals", String(workCount)],
    ["Intensity", workout.intensity],
    ["Level", workout.level],
    ["Sport", workout.sport],
    ["Goal", workout.goal.replace("_", " ")],
    ["Location", workout.location],
    ["Equipment", workout.equipment.length ? workout.equipment.join(", ") : "None"],
  ];

  return (
    <AppShell name={user?.name}>
      <Link href="/browse" className="text-sm font-medium text-neutral-400 hover:text-neutral-700">
        ← Back
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {workout.name}
          </h1>
          {workout.coach && (
            <p className="mt-1 text-sm text-neutral-400">by {workout.coach}</p>
          )}
        </div>
        <IntensityBadge intensity={workout.intensity} />
      </div>

      {workout.description && (
        <p className="mt-3 max-w-2xl text-neutral-600">{workout.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {workout.training_effects.map((e) => (
          <Badge key={e} className="bg-mint-50 capitalize text-mint-700">
            {e.replace("_", " ")}
          </Badge>
        ))}
        {workout.tags.map((t) => (
          <Badge key={t} className="bg-neutral-100 text-neutral-600">
            #{t}
          </Badge>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-400">
          Structure
        </p>
        <TimelinePreview blocks={blocks} height="h-3" showLabels />
      </div>

      {/* Facts grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{k}</p>
            <p className="mt-1 font-semibold capitalize text-neutral-900">{v}</p>
          </div>
        ))}
      </div>

      {/* Phase-by-phase timeline */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-400">
          Timeline · {phases.length} phases
        </p>
        <ol className="space-y-1.5">
          {phases.map((p) => (
            <li
              key={p.index}
              className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PHASE_STYLES[p.type].bar}`} />
              <span className="flex-1 font-medium text-neutral-800">
                {p.name}
                {p.totalRounds > 1 && (
                  <span className="ml-2 text-xs text-neutral-400">
                    round {p.round}/{p.totalRounds}
                  </span>
                )}
              </span>
              <span className="tabular text-sm font-semibold text-neutral-500">
                {fmtClock(p.seconds)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-20 mt-8 flex gap-3 md:bottom-6">
        <Link
          href={`/run/${workout.id}`}
          className="flex-1 rounded-2xl bg-mint-500 px-6 py-4 text-center text-base font-bold text-white shadow-card transition hover:bg-mint-600"
        >
          Start workout
        </Link>
        <SaveButton workoutId={workout.id} initialSaved={savedIds.has(workout.id)} />
      </div>
    </AppShell>
  );
}
