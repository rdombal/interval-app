import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint-500 text-white font-bold">I</span>
          <span className="text-lg font-bold tracking-tight">Interval</span>
        </div>
        <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
          Log in
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <section className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700">
              Build it once. Just press start.
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">
              Interval workouts without
              <span className="text-mint-600"> fighting your watch.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-neutral-600">
              Build a warmup, intervals, rounds and a cooldown in under a minute.
              Save them. Then run a big, calm, motivating timer that talks you
              through every phase.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-mint-500 px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-mint-600"
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/login?next=/browse"
                className="rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-bold text-neutral-700 hover:border-neutral-300"
              >
                Browse the library
              </Link>
            </div>
          </div>

          {/* Hero signature: a mock live-runner card */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-card">
              <div className="flex items-center justify-between text-sm font-semibold text-heat-600">
                <span>Work</span>
                <span className="text-neutral-400">Round 3 / 8</span>
              </div>
              <div className="my-6 grid place-items-center">
                <div className="relative grid h-44 w-44 place-items-center rounded-full border-8 border-heat-100">
                  <div className="absolute inset-0 rounded-full border-8 border-heat-500 [clip-path:polygon(50%_50%,50%_0,100%_0,100%_100%,50%_100%)]" />
                  <span className="tabular text-5xl font-extrabold text-neutral-900">0:18</span>
                </div>
              </div>
              <p className="text-center text-sm text-neutral-400">Next · Rest 0:10</p>
              <div className="mt-5 flex gap-3">
                <div className="h-12 flex-1 rounded-2xl bg-neutral-100" />
                <div className="grid h-12 flex-1 place-items-center rounded-2xl bg-mint-500 text-sm font-bold text-white">
                  Pause
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-neutral-100 py-12 sm:grid-cols-3">
          {[
            ["Fast to build", "A guided flow, not a spreadsheet. Goal, time, rounds, done."],
            ["Made to run", "Huge numbers, phase colours, audio cues, and a next-up preview."],
            ["Yours to keep", "Save favourites and your own creations to a private library."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-3xl bg-neutral-50 p-6">
              <h3 className="font-bold text-neutral-900">{t}</h3>
              <p className="mt-1.5 text-sm text-neutral-600">{d}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-5 py-10 text-sm text-neutral-400">
        Interval · a focused interval-training companion.
      </footer>
    </div>
  );
}
