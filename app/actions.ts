"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PhaseType } from "@/lib/types";

// ---- Toggle a workout in the user's saved collection ----
export async function toggleSave(workoutId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("saved_workouts")
    .select("workout_id")
    .eq("user_id", user.id)
    .eq("workout_id", workoutId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("saved_workouts")
      .delete()
      .eq("user_id", user.id)
      .eq("workout_id", workoutId);
  } else {
    await supabase
      .from("saved_workouts")
      .insert({ user_id: user.id, workout_id: workoutId });
  }

  revalidatePath("/saved");
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/browse");
  return { saved: !existing };
}

// ---- Shape produced by the builder ----
export interface BuilderBlock {
  type: PhaseType;
  name: string;
  duration_seconds: number;
  grouped: boolean; // part of the repeated round set
}

export interface CreateWorkoutInput {
  name: string;
  description?: string;
  sport: string;
  goal: string;
  intensity: "low" | "moderate" | "high" | "max";
  level: "beginner" | "intermediate" | "advanced";
  location: string;
  equipment: string[];
  training_effects: string[];
  rounds: number;
  blocks: BuilderBlock[];
}

export async function createWorkout(input: CreateWorkoutInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({
      owner_id: user.id,
      name: input.name.trim() || "My workout",
      description: input.description ?? "",
      sport: input.sport,
      goal: input.goal,
      intensity: input.intensity,
      level: input.level,
      location: input.location,
      equipment: input.equipment,
      training_effects: input.training_effects,
      tags: [],
      coach: "",
      is_public: false,
    })
    .select("id")
    .single();

  if (error || !workout) {
    throw new Error(error?.message ?? "Could not create workout");
  }

  // One shared group id for every block flagged as part of the repeat set.
  const groupId = crypto.randomUUID();
  const rows = input.blocks.map((b, i) => ({
    workout_id: workout.id,
    position: i,
    type: b.type,
    name: b.name,
    duration_seconds: b.duration_seconds,
    round_group: b.grouped ? groupId : null,
    rounds: b.grouped ? input.rounds : 1,
  }));

  const { error: blockErr } = await supabase.from("workout_blocks").insert(rows);
  if (blockErr) throw new Error(blockErr.message);

  revalidatePath("/dashboard");
  revalidatePath("/saved");
  return { id: workout.id };
}

// ---- Record a finished (or ended) session ----
export async function logSession(input: {
  workoutId: string | null;
  workoutName: string;
  totalSeconds: number;
  phasesCompleted: number;
  finished: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("completed_sessions").insert({
    user_id: user.id,
    workout_id: input.workoutId,
    workout_name: input.workoutName,
    total_seconds: input.totalSeconds,
    phases_completed: input.phasesCompleted,
    finished: input.finished,
  });
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
