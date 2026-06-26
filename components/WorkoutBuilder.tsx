"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TimelinePreview } from "@/components/WorkoutCard";
import {
  WorkoutBlock,
  totalSeconds,
  fmtDuration,
  fmtClock,
  Intensity,
  Level,
} from "@/lib/types";
import { createWorkout, BuilderBlock } from "@/app/actions";

interface State {
  name: string;
  workName: string;
  warmup: number;
  work: number;
  rest: number;
  rounds: number;
  cooldown: number;
  goal: string;
  sport: string;
  intensity: Intensity;
  level: Level;
  location: string;
  equipment: string[];
  description: string;
}

type Preset = {
  id: string;
  title: string;
  blurb: string;
  patch: Partial<State>;
};

const PRESETS: Preset[] = [
  {
    id: "tabata",
    title: "Tabata",
    blurb: "20s on / 10s off × 8",
    patch: { warmup: 120, work: 20, rest: 10, rounds: 8, cooldown: 120, intensity: "max", sport: "hiit", goal: "conditioning", workName: "All-out" },
  },
  {
    id: "3030",
    title: "30 / 30",
    blurb: "30s hard / 30s easy × 10",
    patch: { warmup: 300, work: 30, rest: 30, rounds: 10, cooldown: 300, intensity: "high", sport: "running", goal: "vo2max", workName: "Hard" },
  },
  {
    id: "4020",
    title: "40 / 20",
    blurb: "40s work / 20s rest × 6",
    patch: { warmup: 90, work: 40, rest: 20, rounds: 6, cooldown: 120, intensity: "moderate", sport: "strength", goal: "conditioning", workName: "Work" },
  },
  {
    id: "custom",
    title: "From scratch",
    blurb: "Start blank and tune it",
    patch: { warmup: 60, work: 45, rest: 15, rounds: 8, cooldown: 60, intensity: "moderate", sport: "general", goal: "conditioning", workName: "Work" },
  },
];

const GOALS = ["conditioning", "endurance", "speed", "fat_loss", "vo2max", "recovery"];
const SPORTS = ["general", "hiit", "running", "cycling", "strength", "mobility"];
const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const INTENSITIES: Intensity[] = ["low", "moderate", "high", "max"];
const LOCATIONS = ["anywhere", "home", "gym", "outdoor"];
const EQUIPMENT = ["mat", "dumbbells", "kettlebell", "bike", "rower", "bands"];

const initial: State = {
  name: "",
  workName: "Work",
  warmup: 120,
  work: 30,
  rest: 15,
  rounds: 8,
  cooldown: 120,
  goal: "conditioning",
  sport: "general",
  intensity: "moderate",
  level: "beginner",
  location: "anywhere",
  equipment: [],
  description: "",
};

function Stepper({
  label,
  value,
  onChange,
  step,
  min = 0,
  max = 3600,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min?: number;
  max?: number;
  format: (v: number) => string;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <span className="font-medium text-neutral-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => set(value - step)}
          className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-xl font-bold text-neutral-600 hover:bg-neutral-200"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="tabular w-16 text-center text-lg font-bold text-neutral-900">
          {format(value)}
        </span>
        <button
          onClick={() => set(value + step)}
          className="grid h-9 w-9 place-items-center rounded-full bg-mint-500 text-xl font-bold text-white hover:bg-mint-600"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
            value === o
              ? "border-mint-500 bg-mint-500 text-white"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
          }`}
        >
          {o.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}

export function WorkoutBuilder() {
  const router = useRouter();
  const [s, setS] = useState<State>(initial);
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const patch = (p: Partial<State>) => setS((cur) => ({ ...cur, ...p }));

  // Synthesize the block list for the live preview.
  const blocks: WorkoutBlock[] = useMemo(() => {
    const g = "preview-group";
    const out: WorkoutBlock[] = [];
    let pos = 0;
    if (s.warmup > 0)
      out.push({ id: "w", position: pos++, type: "warmup", name: "Warm up", duration_seconds: s.warmup, round_group: null, rounds: 1 });
    out.push({ id: "wk", position: pos++, type: "work", name: s.workName || "Work", duration_seconds: s.work, round_group: g, rounds: s.rounds });
    if (s.rest > 0)
      out.push({ id: "r", position: pos++, type: "rest", name: "Rest", duration_seconds: s.rest, round_group: g, rounds: s.rounds });
    if (s.cooldown > 0)
      out.push({ id: "c", position: pos++, type: "cooldown", name: "Cool down", duration_seconds: s.cooldown, round_group: null, rounds: 1 });
    return out;
  }, [s.warmup, s.work, s.rest, s.rounds, s.cooldown, s.workName]);

  const total = totalSeconds(blocks);

  function save(thenRun: boolean) {
    setErr(null);
    const builderBlocks: BuilderBlock[] = [];
    if (s.warmup > 0) builderBlocks.push({ type: "warmup", name: "Warm up", duration_seconds: s.warmup, grouped: false });
    builderBlocks.push({ type: "work", name: s.workName || "Work", duration_seconds: s.work, grouped: true });
    if (s.rest > 0) builderBlocks.push({ type: "rest", name: "Rest", duration_seconds: s.rest, grouped: true });
    if (s.cooldown > 0) builderBlocks.push({ type: "cooldown", name: "Cool down", duration_seconds: s.cooldown, grouped: false });

    startSave(async () => {
      try {
        const { id } = await createWorkout({
          name: s.name.trim() || "My interval workout",
          description: s.description,
          sport: s.sport,
          goal: s.goal,
          intensity: s.intensity,
          level: s.level,
          location: s.location,
          equipment: s.equipment,
          training_effects: [s.goal],
          rounds: s.rounds,
          blocks: builderBlocks,
        });
        router.push(thenRun ? `/run/${id}` : `/workouts/${id}`);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Something went wrong saving.");
      }
    });
  }

  const stepTitles = ["Pick a starting point", "Shape the intervals", "Add the details"];

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress dots */}
      <div className="mb-5 flex items-center gap-2">
        {stepTitles.map((t, i) => (
          <div key={t} className="flex flex-1 items-center gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-mint-500" : "bg-neutral-200"}`}
            />
          </div>
        ))}
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-neutral-400">
        Step {step + 1} of 3
      </p>
      <h1 className="mb-5 mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
        {stepTitles[step]}
      </h1>

      {/* Live preview (after step 1) */}
      {step > 0 && (
        <div className="mb-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-neutral-400">
              Preview
            </span>
            <span className="tabular text-lg font-extrabold text-neutral-900">
              {fmtDuration(total)}
            </span>
          </div>
          <TimelinePreview blocks={blocks} height="h-3" showLabels />
          <p className="mt-3 text-sm text-neutral-500">
            {s.rounds}× ({fmtClock(s.work)} work
            {s.rest > 0 ? ` · ${fmtClock(s.rest)} rest` : ""})
          </p>
        </div>
      )}

      {/* ---------- STEP 1 ---------- */}
      {step === 0 && (
        <div className="space-y-4">
          <input
            value={s.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Name your workout"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-base outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          />
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  patch(p.patch);
                  setPreset(p.id);
                }}
                className={`rounded-3xl border p-5 text-left transition ${
                  preset === p.id
                    ? "border-mint-500 bg-mint-50 ring-2 ring-mint-200"
                    : "border-neutral-200 bg-white hover:border-mint-200"
                }`}
              >
                <p className="font-bold text-neutral-900">{p.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{p.blurb}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- STEP 2 ---------- */}
      {step === 1 && (
        <div className="space-y-3">
          <Stepper label="Warm up" value={s.warmup} onChange={(v) => patch({ warmup: v })} step={30} format={fmtClock} />
          <Stepper label="Work" value={s.work} onChange={(v) => patch({ work: v })} step={5} min={5} format={fmtClock} />
          <Stepper label="Rest" value={s.rest} onChange={(v) => patch({ rest: v })} step={5} format={fmtClock} />
          <Stepper label="Rounds" value={s.rounds} onChange={(v) => patch({ rounds: v })} step={1} min={1} max={60} format={(v) => `${v}×`} />
          <Stepper label="Cool down" value={s.cooldown} onChange={(v) => patch({ cooldown: v })} step={30} format={fmtClock} />
        </div>
      )}

      {/* ---------- STEP 3 ---------- */}
      {step === 2 && (
        <div className="space-y-5">
          <Field label="Goal">
            <ChipRow options={GOALS} value={s.goal} onChange={(v) => patch({ goal: v })} />
          </Field>
          <Field label="Sport">
            <ChipRow options={SPORTS} value={s.sport} onChange={(v) => patch({ sport: v })} />
          </Field>
          <Field label="Intensity">
            <ChipRow options={INTENSITIES} value={s.intensity} onChange={(v) => patch({ intensity: v as Intensity })} />
          </Field>
          <Field label="Level">
            <ChipRow options={LEVELS} value={s.level} onChange={(v) => patch({ level: v as Level })} />
          </Field>
          <Field label="Location">
            <ChipRow options={LOCATIONS} value={s.location} onChange={(v) => patch({ location: v })} />
          </Field>
          <Field label="Equipment (optional)">
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((e) => {
                const on = s.equipment.includes(e);
                return (
                  <button
                    key={e}
                    onClick={() =>
                      patch({
                        equipment: on
                          ? s.equipment.filter((x) => x !== e)
                          : [...s.equipment, e],
                      })
                    }
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                      on
                        ? "border-mint-500 bg-mint-500 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Notes (optional)">
            <textarea
              value={s.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={2}
              placeholder="Anything to remember about this session…"
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
            />
          </Field>
          {err && (
            <p className="rounded-xl bg-heat-50 px-4 py-3 text-sm text-heat-700">{err}</p>
          )}
        </div>
      )}

      {/* Footer nav */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((x) => x - 1)}
            className="rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-bold text-neutral-700 hover:border-neutral-300"
          >
            Back
          </button>
        )}
        {step < 2 ? (
          <button
            onClick={() => setStep((x) => x + 1)}
            disabled={step === 0 && !preset}
            className="flex-1 rounded-2xl bg-mint-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-mint-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {step === 0 && !preset ? "Pick a starting point" : "Continue"}
          </button>
        ) : (
          <>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="flex-1 rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-bold text-neutral-700 transition hover:border-neutral-300 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="flex-1 rounded-2xl bg-mint-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-mint-600 disabled:opacity-50"
            >
              Save & run
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-neutral-700">{label}</p>
      {children}
    </div>
  );
}
