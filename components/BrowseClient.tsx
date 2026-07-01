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
  { id: "short", label: "Under 10 min" },
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
          ? "border-mint-500 bg-mint-500 text-white shadow-sm"
          : "border-neutral-200 bg-white/80 text-neutral-600 hover:border-mint-300 hover:text-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function BrowseClient({ workouts }: { workouts: WorkoutWithBlocks[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
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

  // Non-default filters, shown as removable chips on the toolbar.
  const active: { label: string; clear: () => void }[] = [];
  if (duration !== "any")
    active.push({
      label: DURATION.find((d) => d.id === duration)!.label,
      clear: () => setDuration("any"),
    });
  if (intensity !== "any")
    active.push({ label: intensity, clear: () => setIntensity("any") });
  if (level !== "any") active.push({ label: level, clear: () => setLevel("any") });
  if (sport !== "any") active.push({ label: sport, clear: () => setSport("any") });
  if (effect !== "any")
    active.push({ label: effect.replace("_", " "), clear: () => setEffect("any") });
  if (location !== "any")
    active.push({ label: location, clear: () => setLocation("any") });

  const clearAll = () => {
    setDuration("any");
    setIntensity("any");
    setLevel("any");
    setSport("any");
    setEffect("any");
    setLocation("any");
  };

  return (
    <div>
      {/* Compact sticky toolbar: search + Filters toggle + active chips */}
      <div className="sticky top-[57px] z-20 -mx-4 mb-4 border-b border-white/40 bg-white/70 px-4 pb-3 pt-1 backdrop-blur-md">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search workouts…"
            className="w-full flex-1 rounded-2xl border border-neutral-200 bg-white/85 px-4 py-3 text-sm outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          />
          <button
            onClick={() => setOpen((o) => !o)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              open || active.length
                ? "border-mint-500 bg-mint-50 text-mint-700"
                : "border-neutral-200 bg-white/85 text-neutral-700 hover:border-neutral-300"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h18M6 12h12M10 19h4" />
            </svg>
            Filters
            {active.length > 0 && (
              <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-mint-500 px-1 text-xs font-bold text-white">
                {active.length}
              </span>
            )}
          </button>
        </div>

        {active.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {active.map((a) => (
              <button
                key={a.label}
                onClick={a.clear}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint-500 py-1 pl-3 pr-2 text-sm font-medium capitalize text-white transition hover:bg-mint-600"
              >
                {a.label}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-sm font-medium text-neutral-500 underline-offset-2 transition hover:text-neutral-800 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Expandable, labelled filter panel */}
      {open && (
        <div className="glass-strong mb-5 space-y-4 rounded-3xl p-5 shadow-glass">
          <Section label="Duration">
            {DURATION.map((d) => (
              <Chip key={d.id} active={duration === d.id} onClick={() => setDuration(d.id)}>
                {d.label}
              </Chip>
            ))}
          </Section>
          <Section label="Intensity">
            {(["any", "low", "moderate", "high", "max"] as const).map((i) => (
              <Chip key={i} active={intensity === i} onClick={() => setIntensity(i)}>
                {i === "any" ? "Any" : i}
              </Chip>
            ))}
          </Section>
          <Section label="Level">
            {(["any", "beginner", "intermediate", "advanced"] as const).map((l) => (
              <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
                {l === "any" ? "Any" : l}
              </Chip>
            ))}
          </Section>
          <Section label="Sport">
            <Chip active={sport === "any"} onClick={() => setSport("any")}>
              Any
            </Chip>
            {sports.map((s) => (
              <Chip key={s} active={sport === s} onClick={() => setSport(s)}>
                {s}
              </Chip>
            ))}
          </Section>
          <Section label="Training effect">
            <Chip active={effect === "any"} onClick={() => setEffect("any")}>
              Any
            </Chip>
            {effects.map((e) => (
              <Chip key={e} active={effect === e} onClick={() => setEffect(e)}>
                {e.replace("_", " ")}
              </Chip>
            ))}
          </Section>
          <Section label="Location">
            <Chip active={location === "any"} onClick={() => setLocation("any")}>
              Anywhere
            </Chip>
            {locations.map((l) => (
              <Chip key={l} active={location === l} onClick={() => setLocation(l)}>
                {l}
              </Chip>
            ))}
          </Section>
          <div className="flex items-center justify-between border-t border-neutral-200/70 pt-4">
            <button
              onClick={clearAll}
              className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-800"
            >
              Clear all
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-mint-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-mint-600"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <p className="mb-3 text-sm text-neutral-400">
        {filtered.length} {filtered.length === 1 ? "workout" : "workouts"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/70 p-10 text-center">
          <p className="font-semibold text-neutral-700">No workouts match those filters.</p>
          <p className="mt-1 text-sm text-neutral-500">Try widening the search or clearing a filter.</p>
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
