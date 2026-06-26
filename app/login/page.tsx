import Link from "next/link";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const isSignup = sp.mode === "signup";
  const next = sp.next ?? "/dashboard";

  return (
    <div className="grid min-h-dvh place-items-center bg-white px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint-500 text-white font-bold">I</span>
          <span className="text-lg font-bold tracking-tight">Interval</span>
        </Link>

        <h1 className="text-center text-2xl font-bold text-neutral-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          {isSignup ? "Start building workouts in seconds." : "Log in to your workout library."}
        </p>

        {sp.error && (
          <p className="mt-5 rounded-xl bg-heat-50 px-4 py-3 text-sm text-heat-700">
            {decodeURIComponent(sp.error)}
          </p>
        )}

        <form className="mt-6 space-y-3">
          <input type="hidden" name="next" value={next} />
          <input
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          />
          <button
            formAction={isSignup ? signUp : signIn}
            className="w-full rounded-2xl bg-mint-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-mint-600"
          >
            {isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-500">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-mint-600">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href={`/login?mode=signup&next=${encodeURIComponent(next)}`} className="font-semibold text-mint-600">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
