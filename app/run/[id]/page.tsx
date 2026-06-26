import { notFound } from "next/navigation";
import { WorkoutRunner } from "@/components/WorkoutRunner";
import { getWorkout } from "@/lib/queries";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkout(id);
  if (!workout || (workout.workout_blocks ?? []).length === 0) notFound();

  return <WorkoutRunner workout={workout} />;
}
