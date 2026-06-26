// Core domain types + timeline expansion logic.
// The runner, previews and builder all read from expandTimeline().

export type PhaseType = "warmup" | "work" | "rest" | "recovery" | "cooldown";
export type Intensity = "low" | "moderate" | "high" | "max";
export type Level = "beginner" | "intermediate" | "advanced";

export interface WorkoutBlock {
  id: string;
  position: number;
  type: PhaseType;
  name: string;
  duration_seconds: number;
  round_group: string | null;
  rounds: number;
}

export interface Workout {
  id: string;
  owner_id: string | null;
  name: string;
  description: string;
  sport: string;
  goal: string;
  intensity: Intensity;
  level: Level;
  location: string;
  equipment: string[];
  training_effects: string[];
  tags: string[];
  coach: string;
  is_public: boolean;
  created_at: string;
}

export interface WorkoutWithBlocks extends Workout {
  workout_blocks: WorkoutBlock[];
}

export interface Phase {
  type: PhaseType;
  name: string;
  seconds: number;
  round: number; // 1-based within its repeat group (1 when ungrouped)
  totalRounds: number;
  index: number; // position in the expanded list
}

// Walk ordered blocks; collapse consecutive blocks that share a round_group
// into a unit that repeats `rounds` times. Everything else plays once.
export function expandTimeline(blocks: WorkoutBlock[]): Phase[] {
  const sorted = [...blocks].sort((a, b) => a.position - b.position);
  const phases: Phase[] = [];
  let i = 0;
  while (i < sorted.length) {
    const b = sorted[i];
    if (b.round_group) {
      const group: WorkoutBlock[] = [];
      const key = b.round_group;
      while (i < sorted.length && sorted[i].round_group === key) {
        group.push(sorted[i]);
        i++;
      }
      const rounds = group[0].rounds || 1;
      for (let r = 1; r <= rounds; r++) {
        for (const gb of group) {
          phases.push({
            type: gb.type,
            name: gb.name,
            seconds: gb.duration_seconds,
            round: r,
            totalRounds: rounds,
            index: phases.length,
          });
        }
      }
    } else {
      phases.push({
        type: b.type,
        name: b.name,
        seconds: b.duration_seconds,
        round: 1,
        totalRounds: 1,
        index: phases.length,
      });
      i++;
    }
  }
  return phases;
}

export function totalSeconds(blocks: WorkoutBlock[]): number {
  return expandTimeline(blocks).reduce((s, p) => s + p.seconds, 0);
}

export function fmtClock(total: number): string {
  const s = Math.max(0, Math.round(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function fmtDuration(total: number): string {
  const s = Math.max(0, Math.round(total));
  const m = Math.round(s / 60);
  if (m < 1) return `${s}s`;
  return `${m} min`;
}

// Visual identity: each phase type owns a colour. Work = heat, the rest cool.
export const PHASE_STYLES: Record<
  PhaseType,
  { label: string; bar: string; text: string; soft: string; ring: string }
> = {
  warmup:   { label: "Warm up",  bar: "bg-amber-400",  text: "text-amber-600",   soft: "bg-amber-50",   ring: "stroke-amber-400" },
  work:     { label: "Work",     bar: "bg-heat-500",   text: "text-heat-600",    soft: "bg-heat-50",    ring: "stroke-heat-500" },
  rest:     { label: "Rest",     bar: "bg-sky-400",    text: "text-sky-600",     soft: "bg-sky-50",     ring: "stroke-sky-400" },
  recovery: { label: "Recovery", bar: "bg-mint-400",   text: "text-mint-600",    soft: "bg-mint-50",    ring: "stroke-mint-400" },
  cooldown: { label: "Cool down",bar: "bg-indigo-400", text: "text-indigo-600",  soft: "bg-indigo-50",  ring: "stroke-indigo-400" },
};

export const INTENSITY_STYLES: Record<Intensity, string> = {
  low: "bg-mint-50 text-mint-700",
  moderate: "bg-amber-50 text-amber-700",
  high: "bg-heat-50 text-heat-700",
  max: "bg-heat-100 text-heat-800",
};
