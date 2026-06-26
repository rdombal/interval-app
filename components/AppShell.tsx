import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({
  name,
  children,
}: {
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <AppHeader name={name} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}
