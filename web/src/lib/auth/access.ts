import { isAuthSessionMissingError, type SupabaseClient } from "@supabase/supabase-js";

export type SupervisorAccess =
  | { status: "authorized"; id: string; fullName: string }
  | { status: "anonymous" | "denied" | "unavailable" };

export async function readSupervisorAccess(client: SupabaseClient): Promise<SupervisorAccess> {
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) {
      const invalidSession = error.code && ["bad_jwt", "user_not_found", "session_not_found",
        "refresh_token_not_found", "refresh_token_already_used"].includes(error.code);
      return { status: isAuthSessionMissingError(error) || invalidSession || error.status === 401 || error.status === 403 ? "anonymous" : "unavailable" };
    }
    if (!user) return { status: "anonymous" };
    const { data: profile, error: profileError } = await client.from("profiles")
      .select("full_name,role,is_active").eq("id", user.id).maybeSingle();
    if (profileError) return { status: "unavailable" };
    if (!profile || profile.role !== "supervisor" || profile.is_active !== true) return { status: "denied" };
    if (typeof profile.full_name !== "string" || !profile.full_name.trim()) return { status: "unavailable" };
    return { status: "authorized", id: user.id, fullName: profile.full_name.trim() };
  } catch { return { status: "unavailable" }; }
}
