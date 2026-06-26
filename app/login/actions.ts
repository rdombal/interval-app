"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "/dashboard";
  return n.startsWith("/") ? n : "/dashboard";
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const next = safeNext(formData.get("next"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const next = safeNext(formData.get("next"));

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}&mode=signup&next=${encodeURIComponent(next)}`);
  // If email confirmations are ON, the user must confirm before a session exists.
  redirect(next);
}
