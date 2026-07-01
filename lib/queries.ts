import { createClient } from "@/lib/supabase/server";
import type { WorkoutWithBlocks, Profile } from "@/lib/types";

const WORKOUT_SELECT =
  "*, workout_blocks(id, position, type, name, duration_seconds, round_group, rounds)";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  return { id: user.id, email: user.email, name: profile?.display_name ?? user.email?.split("@")[0] };
}

export async function getProfile(): Promise<Profile> {
  const empty: Profile = {
    display_name: null,
    training_for: null,
    primary_goal: null,
    primary_sport: null,
    level: null,
  };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;
  const { data } = await supabase
    .from("profiles")
    .select("display_name, training_for, primary_goal, primary_sport, level")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? empty;
}

// All workouts the user can see: public library + their own.
export async function getVisibleWorkouts(): Promise<WorkoutWithBlocks[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkoutWithBlocks[];
}

export async function getWorkout(id: string): Promise<WorkoutWithBlocks | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as WorkoutWithBlocks) ?? null;
}

export async function getSavedIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("saved_workouts")
    .select("workout_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((r) => r.workout_id as string));
}

export async function getSavedWorkouts(): Promise<WorkoutWithBlocks[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("saved_workouts")
    .select(`workout:workouts(${WORKOUT_SELECT})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? [])
    .map((r) => (r as unknown as { workout: WorkoutWithBlocks }).workout)
    .filter(Boolean);
}

export async function getRecentSessions(limit = 5) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("completed_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
