"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  WorkoutWithBlocks,
  PhaseType,
  expandTimeline,
  fmtClock,
} from "@/lib/types";
import { logSession } from "@/app/actions";

const READY_SECONDS = 5;

// A runner step is an expanded phase, plus a synthetic "ready" lead-in.
type StepKind = PhaseType | "ready";
interface Step {
  kind: StepKind;
  name: string;
  seconds: number;
  round: number;
  totalRounds: number;
}

// Phase colours for the immersive screen. `ready` is neutral; the rest reuse
// the app's phase identity (work = heat, etc.) but as full-bleed backgrounds.
const SCREEN: Record<StepKind, { bg: string; accent: string; ring: string; label: string }> = {
  ready:    { bg: "bg-neutral-900", accent: "text-neutral-300", ring: "stroke-neutral-500", label: "Get ready" },
  warmup:   { bg: "bg-sky-500",     accent: "text-sky-50",      ring: "stroke-sky-100",     label: "Warm up" },
  work:     { bg: "bg-heat-500",    accent: "text-heat-50",     ring: "stroke-heat-100",    label: "Work" },
  rest:     { bg: "bg-emerald-500", accent: "text-emerald-50",  ring: "stroke-emerald-100", label: "Rest" },
  recovery: { bg: "bg-mint-500",    accent: "text-mint-50",     ring: "stroke-mint-100",    label: "Recovery" },
  cooldown: { bg: "bg-blue-600",    accent: "text-blue-50",     ring: "stroke-blue-100",    label: "Cool down" },
};

export function WorkoutRunner({ workout }: { workout: WorkoutWithBlocks }) {
  const router = useRouter();

  const steps = useMemo<Step[]>(() => {
    const phases = expandTimeline(workout.workout_blocks ?? []);
    const ready: Step = {
      kind: "ready",
      name: "Get ready",
      seconds: READY_SECONDS,
      round: 1,
      totalRounds: 1,
    };
    return [
      ready,
      ...phases.map((p) => ({
        kind: p.type,
        name: p.name,
        seconds: p.seconds,
        round: p.round,
        totalRounds: p.totalRounds,
      })),
    ];
  }, [workout]);

  const realPhases = steps.length - 1; // excluding ready
  const plannedSeconds = useMemo(
    () => steps.slice(1).reduce((s, p) => s + p.seconds, 0),
    [steps],
  );

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0].seconds);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);

  // Refs that the interval reads without going stale.
  const lastTick = useRef<number>(Date.now());
  const elapsed = useRef(0); // workout time, excludes the ready lead-in
  const phasesDone = useRef(0);
  const prevCeil = useRef(steps[0].seconds);
  const logged = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const current = steps[index];
  const next = index < steps.length - 1 ? steps[index + 1] : null;

  // ---- Audio cues (created on first gesture so iOS unlocks it) ----
  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audio.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) audio.current = new Ctx();
    }
    if (audio.current?.state === "suspended") void audio.current.resume();
  }, []);

  const beep = useCallback((freq: number, dur = 0.12, vol = 0.25) => {
    const a = audio.current;
    if (!a || mutedRef.current) return;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(a.destination);
    const t = a.currentTime;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  }, []);

  const buzz = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const cueFor = useCallback(
    (kind: StepKind) => {
      if (kind === "work") {
        beep(680, 0.18, 0.32);
        buzz([0, 90, 40, 90]);
      } else if (kind === "ready") {
        // no cue
      } else {
        beep(440, 0.16, 0.28);
        buzz(70);
      }
    },
    [beep],
  );

  // ---- Persist the session exactly once ----
  const persist = useCallback(
    (didFinish: boolean) => {
      if (logged.current) return;
      logged.current = true;
      void logSession({
        workoutId: workout.id,
        workoutName: workout.name,
        totalSeconds: Math.round(elapsed.current),
        phasesCompleted: phasesDone.current,
        finished: didFinish,
      });
    },
    [workout.id, workout.name],
  );

  const finish = useCallback(
    (didFinish: boolean) => {
      setRunning(false);
      setDone(true);
      setFinished(didFinish);
      if (didFinish) {
        // Rising triple beep
        beep(660, 0.16, 0.3);
        setTimeout(() => beep(880, 0.16, 0.3), 170);
        setTimeout(() => beep(1100, 0.28, 0.32), 350);
        buzz([0, 120, 60, 120, 60, 220]);
      }
      persist(didFinish);
    },
    [beep, persist],
  );

  const advance = useCallback(() => {
    setIndex((i) => {
      const cur = steps[i];
      if (cur.kind !== "ready") phasesDone.current += 1;
      const ni = i + 1;
      if (ni >= steps.length) {
        finish(true);
        return i;
      }
      const nextStep = steps[ni];
      setRemaining(nextStep.seconds);
      prevCeil.current = Math.ceil(nextStep.seconds);
      cueFor(nextStep.kind);
      return ni;
    });
  }, [steps, finish, cueFor]);

  // ---- The clock ----
  useEffect(() => {
    if (!running || done) return;
    lastTick.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;

      setRemaining((r) => {
        if (steps[index].kind !== "ready") elapsed.current += dt;
        const nr = r - dt;
        const c = Math.ceil(Math.max(0, nr));
        if (c < prevCeil.current && c <= 3 && c >= 1) beep(880, 0.07, 0.22);
        prevCeil.current = c;
        if (nr <= 0) {
          advance();
          return 0;
        }
        return nr;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running, done, index, steps, advance, beep]);

  // ---- Keep the screen awake while running ----
  useEffect(() => {
    let released = false;
    async function lock() {
      try {
        if ("wakeLock" in navigator && running && !done) {
          wakeLock.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* not supported — fine */
      }
    }
    void lock();
    const onVisible = () => {
      if (document.visibilityState === "visible") void lock();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (wakeLock.current && !released) void wakeLock.current.release();
      void wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };
  }, [running, done]);

  // Kick the audio context to life on mount (the user already tapped "Start"
  // on the detail page to get here, but resume again to be safe).
  useEffect(() => {
    ensureAudio();
  }, [ensureAudio]);

  function reset() {
    logged.current = false;
    elapsed.current = 0;
    phasesDone.current = 0;
    prevCeil.current = steps[0].seconds;
    setIndex(0);
    setRemaining(steps[0].seconds);
    setFinished(false);
    setDone(false);
    setRunning(true);
    ensureAudio();
  }

  // ---------- Completion summary ----------
  if (done) {
    const mins = Math.floor(elapsed.current / 60);
    const secs = Math.round(elapsed.current % 60);
    const workDone = steps
      .slice(1, 1 + phasesDone.current)
      .filter((s) => s.kind === "work").length;

    return (
      <div className="grid min-h-dvh place-items-center bg-neutral-950 px-6 text-white">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint-500 text-4xl">
            {finished ? "✓" : "·"}
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
            {finished ? "Nice work." : "Session ended"}
          </h1>
          <p className="mt-1 text-neutral-400">{workout.name}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["Time", `${mins}:${secs.toString().padStart(2, "0")}`],
              ["Phases", `${phasesDone.current}/${realPhases}`],
              ["Work sets", String(workDone)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-neutral-900 p-4">
                <p className="tabular text-2xl font-extrabold">{v}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                  {k}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={reset}
              className="w-full rounded-2xl bg-mint-500 px-6 py-4 text-base font-bold text-white transition hover:bg-mint-400"
            >
              Run it again
            </button>
            <Link
              href="/dashboard"
              className="block w-full rounded-2xl border border-neutral-700 px-6 py-4 text-base font-bold text-neutral-200 hover:bg-neutral-900"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Live screen ----------
  const screen = SCREEN[current.kind];
  const pct = current.seconds > 0 ? remaining / current.seconds : 0;
  const R = 130;
  const C = 2 * Math.PI * R;

  // Overall progress across real phases (ignoring the ready lead-in).
  const overall = steps.slice(1);
  const overallTotal = plannedSeconds || 1;

  return (
    <div
      className={`relative flex min-h-dvh flex-col ${screen.bg} text-white transition-colors duration-500`}
    >
      {/* Top bar: phase + round + mute/close */}
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-90">
            {current.kind === "ready" ? "Starting" : screen.label}
          </p>
          {current.totalRounds > 1 && (
            <p className={`text-sm font-medium ${screen.accent}`}>
              Round {current.round} / {current.totalRounds}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute cues" : "Mute cues"}
            className="rounded-full p-2.5 text-white/90 hover:bg-white/15"
          >
            {muted ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
            )}
          </button>
          <Link
            href={`/workouts/${workout.id}`}
            aria-label="Close runner"
            className="rounded-full p-2.5 text-white/90 hover:bg-white/15"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </Link>
        </div>
      </div>

      {/* Centre: phase name + ring + giant countdown */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="mb-6 text-center text-2xl font-bold sm:text-3xl">
          {current.name}
        </p>

        <div className={`relative grid place-items-center ${running ? "breathe" : ""}`}>
          <svg viewBox="0 0 300 300" className="h-72 w-72 -rotate-90">
            <circle cx="150" cy="150" r={R} fill="none" className="stroke-white/20" strokeWidth="14" />
            <circle
              cx="150"
              cy="150"
              r={R}
              fill="none"
              className="stroke-white"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
          </svg>
          <div className="absolute grid place-items-center">
            <span className="tabular text-7xl font-extrabold leading-none sm:text-8xl">
              {fmtClock(remaining)}
            </span>
          </div>
        </div>

        <div className="mt-7 h-6 text-center text-base font-medium opacity-90">
          {next ? (
            <span>
              Next · {next.name} {fmtClock(next.seconds)}
            </span>
          ) : (
            <span>Last one — finish strong</span>
          )}
        </div>
      </div>

      {/* Overall progress strip (the signature, inverted for the dark screen) */}
      <div className="px-5">
        <div className="flex h-1.5 w-full gap-px overflow-hidden rounded-full">
          {overall.map((s, i) => {
            const fullyDone = i < phasesDone.current;
            const isCurrent = i === phasesDone.current;
            return (
              <div
                key={i}
                style={{ width: `${(s.seconds / overallTotal) * 100}%` }}
                className={
                  fullyDone
                    ? "bg-white"
                    : isCurrent
                      ? "bg-white/70"
                      : "bg-white/25"
                }
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 gap-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <button
          onClick={() => finish(false)}
          className="rounded-2xl bg-white/15 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
        >
          End
        </button>
        <button
          onClick={() => {
            ensureAudio();
            setRunning((r) => !r);
            lastTick.current = Date.now();
          }}
          className="col-span-2 rounded-2xl bg-white py-4 text-base font-extrabold text-neutral-900 transition hover:bg-white/90"
        >
          {running ? "Pause" : "Resume"}
        </button>
        <button
          onClick={() => advance()}
          aria-label="Skip phase"
          className="grid place-items-center rounded-2xl bg-white/15 py-4 text-white backdrop-blur transition hover:bg-white/25"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M6 5l9 7-9 7V5zm10 0h2v14h-2z" /></svg>
        </button>
      </div>
    </div>
  );
}
