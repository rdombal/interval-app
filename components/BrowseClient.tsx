"use client";

import { useMemo, useState } from "react";
import { WorkoutCard } from "@/components/WorkoutCard";
import {
  WorkoutWithBlocks,
  totalSeconds,
  Intensity,
  Level,
} from "@/lib/types";

type DurationBucket = "any" | "short" | "medium" | "long";

const DURATION: { id: DurationBucket; label: string }[] = [
  { id: "any", label: "Any length" },
  { id: "short", label: "< 10 min" },
  { id: "medium", label: "10–25 min" },
  { id: "long", label: "25 min +" },
];

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
        active
          ? "border-mint-500 bg-mint-500 text-white"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

export function BrowseClient({ workouts }: { workouts: WorkoutWithBlocks[] }) {
  const [q, setQ] = useState("");
  const [duration, setDuration] = useState<DurationBucket>("any");
  const [intensity, setIntensity] = useState<Intensity | "any">("any");
  const [level, setLevel] = useState<Level | "any">("any");
  const [sport, setSport] = useState<string>("any");
  const [effect, setEffect] = useState<string>("any");
  const [location, setLocation] = useState<string>("any");

  const sports = useMemo(() => uniq(workouts.map((w) => w.sport)), [workouts]);
  const effects = useMemo(
    () => uniq(workouts.flatMap((w) => w.training_effects)),
    [workouts],
  );
  const locations = useMemo(() => uniq(workouts.map((w) => w.location)), [workouts]);

  const filtered = useMemo(() => {
    return workouts.filter((w) => {
      const secs = totalSeconds(w.workout_blocks ?? []);
      if (duration === "short" && secs >= 600) return false;
      if (duration === "medium" && (secs < 600 || secs > 1500)) return false;
      if (duration === "long" && secs <= 1500) return false;
      if (intensity !== "any" && w.intensity !== intensity) return false;
      if (level !== "any" && w.level !== level) return false;
      if (sport !== "any" && w.sport !== sport) return false;
      if (location !== "any" && w.location !== location) return false;
      if (effect !== "any" && !w.training_effects.includes(effect)) return false;
      if (q.trim()) {
        const hay = `${w.name} ${w.description} ${w.goal} ${w.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [workouts, q, duration, intensity, level, sport, effect, location]);

  return (
    <div>
      <div className="sticky top-[57px] z-20 -mx-4 mb-5 bg-neutral-50/90 px-4 pb-3 pt-1 backdrop-blur">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search workouts…"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {DURATION.map((d) => (
            <Chip key={d.id} active={duration === d.id} onClick={() => setDuration(d.id)}>
              {d.label}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-neutral-200" />
          {(["any", "low", "moderate", "high", "max"] as const).map((i) => (
            <Chip key={i} active={intensity === i} onClick={() => setIntensity(i)}>
              {i === "any" ? "Any intensity" : i}
            </Chip>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(["any", "beginner", "intermediate", "advanced"] as const).map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
              {l === "any" ? "Any level" : l}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-neutral-200" />
          <Chip active={sport === "any"} onClick={() => setSport("any")}>
            Any sport
          </Chip>
          {sports.map((s) => (
            <Chip key={s} active={sport === s} onClick={() => setSport(s)}>
              {s}
            </Chip>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <Chip active={effect === "any"} onClick={() => setEffect("any")}>
            Any effect
          </Chip>
          {effects.map((e) => (
            <Chip key={e} active={effect === e} onClick={() => setEffect(e)}>
              {e.replace("_", " ")}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-neutral-200" />
          <Chip active={location === "any"} onClick={() => setLocation("any")}>
            Anywhere
          </Chip>
          {locations.map((l) => (
            <Chip key={l} active={location === l} onClick={() => setLocation(l)}>
              {l}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-neutral-400">
        {filtered.length} {filtered.length === 1 ? "workout" : "workouts"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="font-semibold text-neutral-700">No workouts match those filters.</p>
          <p className="mt-1 text-sm text-neutral-500">Try widening the search or clearing a chip.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}
