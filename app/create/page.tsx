import { AppShell } from "@/components/AppShell";
import { WorkoutBuilder } from "@/components/WorkoutBuilder";
import { getCurrentUser } from "@/lib/queries";

export default async function CreatePage() {
  const user = await getCurrentUser();
  return (
    <AppShell name={user?.name}>
      <WorkoutBuilder />
    </AppShell>
  );
}
