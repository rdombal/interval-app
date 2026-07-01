import Link from "next/link";
import { signOut } from "@/app/actions";

export function AppHeader({ name }: { name?: string }) {
  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0 shadow-glass">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 font-bold text-white shadow-glow">
            I
          </span>
          <span className="text-lg font-bold tracking-tight">Interval</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
          <Link href="/browse" className="transition hover:text-neutral-900">Browse</Link>
          <Link href="/create" className="transition hover:text-neutral-900">Create</Link>
          <Link href="/saved" className="transition hover:text-neutral-900">Saved</Link>
        </nav>
        <div className="flex items-center gap-3">
          {name && <span className="hidden text-sm text-neutral-500 sm:inline">Hi, {name}</span>}
          <form action={signOut}>
            <button className="rounded-xl px-3 py-1.5 text-sm font-medium text-neutral-500 transition hover:bg-white/60 hover:text-neutral-900">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
