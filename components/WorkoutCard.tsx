import Link from "next/link";
import {
  WorkoutBlock,
  expandTimeline,
  totalSeconds,
  fmtDuration,
  PHASE_STYLES,
  INTENSITY_STYLES,
  Intensity,
  WorkoutWithBlocks,
} from "@/lib/types";

export function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function IntensityBadge({ intensity }: { intensity: Intensity }) {
  return <Badge className={INTENSITY_STYLES[intensity]}>{intensity}</Badge>;
}

const PHASE_ORDER = ["warmup", "work", "rest", "recovery", "cooldown"] as const;

// The signature element: a stacked bar where each segment is a phase, width
// proportional to its duration. `legend` shows a colour key:
//   "dots" = compact coloured dots (used on cards)
//   "full" = dots + labels (used on detail + builder previews)
export function TimelinePreview({
  blocks,
  height = "h-2.5",
  legend = "none",
  showLabels = false,
}: {
  blocks: WorkoutBlock[];
  height?: string;
  legend?: "none" | "dots" | "full";
  showLabels?: boolean;
}) {
  const phases = expandTimeline(blocks);
  const total = phases.reduce((s, p) => s + p.seconds, 0) || 1;
  const mode = legend !== "none" ? legend : showLabels ? "full" : "none";
  const present = PHASE_ORDER.filter((t) => phases.some((p) => p.type === t));

  return (
    <div>
      <div
        className={`flex w-full overflow-hidden rounded-full ring-1 ring-black/5 ${height}`}
      >
        {phases.map((p) => (
          <div
            key={p.index}
            className={PHASE_STYLES[p.type].bar}
            style={{ width: `${(p.seconds / total) * 100}%` }}
            title={`${p.name} · ${p.seconds}s`}
          />
        ))}
      </div>

      {mode === "dots" && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {present.map((t) => (
            <span
              key={t}
              title={PHASE_STYLES[t].label}
              className={`h-2 w-2 rounded-full ${PHASE_STYLES[t].bar}`}
            />
          ))}
        </div>
      )}

      {mode === "full" && (
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
          {present.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${PHASE_STYLES[t].bar}`} />
              {PHASE_STYLES[t].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkoutCard({ workout }: { workout: WorkoutWithBlocks }) {
  const blocks = workout.workout_blocks ?? [];
  const phases = expandTimeline(blocks);
  const workCount = phases.filter((p) => p.type === "work").length;
  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="group block rounded-3xl border border-neutral-200/70 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-mint-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-400"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold leading-tight text-neutral-900 group-hover:text-mint-700">
            {workout.name}
          </h3>
          <p className="mt-0.5 text-sm capitalize text-neutral-500">
            {workout.sport} · {workout.goal.replace("_", " ")}
          </p>
        </div>
        <IntensityBadge intensity={workout.intensity} />
      </div>

      <TimelinePreview blocks={blocks} legend="dots" />

      <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
        <span className="font-semibold tabular text-neutral-900">
          {fmtDuration(totalSeconds(blocks))}
        </span>
        <span className="text-neutral-400">
          {workCount} {workCount === 1 ? "interval" : "intervals"} · {workout.level}
        </span>
      </div>
    </Link>
  );
}
