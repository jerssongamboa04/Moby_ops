"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { readSupervisorAccess } from "../../lib/auth/access";
import type { LoginState, LogoutState } from "../../lib/auth/types";

export async function signInAction(_previous: LoginState, form: FormData): Promise<LoginState> {
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string" ||
    email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    password.length === 0 || password.length > 1024) return { error: "invalid" };
  if (!getSupabaseConfig()) return { error: "configuration" };
  try {
    const client = await createSupabaseServerClient({ writable: true });
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.status === 400 || error.status === 401 ? "credentials" : "unavailable" };
    const access = await readSupervisorAccess(client);
    if (access.status !== "authorized") {
      const { error: cleanupError } = await client.auth.signOut({ scope: "local" });
      if (cleanupError) return { error: "unavailable" };
      return { error: access.status === "denied" ? "denied" : "unavailable" };
    }
  } catch { return { error: "unavailable" }; }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction(previous: LogoutState): Promise<LogoutState> {
  void previous;
  try {
    const client = await createSupabaseServerClient({ writable: true });
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return { error: "unavailable" };
  } catch { return { error: "unavailable" }; }
  revalidatePath("/", "layout");
  redirect("/login");
}
