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
    <div className="relative min-h-dvh">
      {/* Ambient colour — soft blurred blobs the glass chrome refracts */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-mint-300/25 blur-3xl" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-heat-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/15 blur-3xl" />
      </div>

      <AppHeader name={name} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}
