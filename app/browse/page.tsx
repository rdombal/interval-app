import { AppShell } from "@/components/AppShell";
import { BrowseClient } from "@/components/BrowseClient";
import { getCurrentUser, getVisibleWorkouts } from "@/lib/queries";

export default async function BrowsePage() {
  const [user, workouts] = await Promise.all([
    getCurrentUser(),
    getVisibleWorkouts(),
  ]);

  return (
    <AppShell name={user?.name}>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Browse workouts</h1>
      <p className="mb-4 text-neutral-500">Find a session, preview it, press start.</p>
      <BrowseClient workouts={workouts} />
    </AppShell>
  );
}
