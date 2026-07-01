"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";
import { saveProfile } from "@/app/actions";

const GOALS = ["conditioning", "endurance", "speed", "fat_loss", "vo2max", "recovery"];
const SPORTS = ["general", "hiit", "running", "cycling", "strength", "mobility"];
const LEVELS = ["beginner", "intermediate", "advanced"];

function Choice({
  options,
  value,
  onChange,
  allowNone = true,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  allowNone?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {allowNone && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            value === null
              ? "border-mint-500 bg-mint-500 text-white"
              : "border-neutral-200 bg-white/80 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          No preference
        </button>
      )}
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
            value === o
              ? "border-mint-500 bg-mint-500 text-white"
              : "border-neutral-200 bg-white/80 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          {o.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-800">{label}</p>
      {hint && <p className="mb-2 mt-0.5 text-xs text-neutral-400">{hint}</p>}
      <div className={hint ? "" : "mt-2"}>{children}</div>
    </div>
  );
}

export function ProfileForm({
  initial,
  email,
}: {
  initial: Profile;
  email?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.display_name ?? "");
  const [trainingFor, setTrainingFor] = useState(initial.training_for ?? "");
  const [goal, setGoal] = useState<string | null>(initial.primary_goal);
  const [sport, setSport] = useState<string | null>(initial.primary_sport);
  const [level, setLevel] = useState<string | null>(initial.level);
  const [saving, startSave] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    startSave(async () => {
      try {
        await saveProfile({
          display_name: name,
          training_for: trainingFor,
          primary_goal: goal,
          primary_sport: sport,
          level,
        });
        router.push("/dashboard");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not save your profile.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
        Your profile
      </h1>
      <p className="mb-6 mt-1 text-neutral-500">
        Set your name and what you&apos;re training for. We&apos;ll use it to
        suggest sessions that fit.
      </p>

      <div className="space-y-6 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card">
        <Field label="First name" hint="This is what we'll greet you with.">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ryan"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          />
          {email && !name && (
            <p className="mt-1.5 text-xs text-neutral-400">
              Signed in as {email}
            </p>
          )}
        </Field>

        <Field
          label="What are you training for?"
          hint="Optional — a race, an event, or just a focus."
        >
          <input
            value={trainingFor}
            onChange={(e) => setTrainingFor(e.target.value)}
            placeholder="e.g. a 10K in spring, or general fitness"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          />
        </Field>

        <Field label="Primary goal">
          <Choice options={GOALS} value={goal} onChange={setGoal} />
        </Field>

        <Field label="Main sport">
          <Choice options={SPORTS} value={sport} onChange={setSport} />
        </Field>

        <Field label="Your level">
          <Choice options={LEVELS} value={level} onChange={setLevel} />
        </Field>

        {err && (
          <p className="rounded-xl bg-heat-50 px-4 py-3 text-sm text-heat-700">
            {err}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-mint-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-mint-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}
