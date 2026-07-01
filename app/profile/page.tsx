import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentUser, getProfile } from "@/lib/queries";

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getProfile()]);
  return (
    <AppShell name={user?.name}>
      <ProfileForm initial={profile} email={user?.email ?? undefined} />
    </AppShell>
  );
}
