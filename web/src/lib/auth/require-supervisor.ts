import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../supabase/server";
import { getSupabaseConfig } from "../supabase/config";
import { readSupervisorAccess } from "./access";

export async function requireSupervisor() {
  if (!getSupabaseConfig()) redirect("/login");
  const access = await readSupervisorAccess(await createSupabaseServerClient());
  if (access.status === "anonymous") redirect("/login");
  if (access.status === "denied") redirect("/access-denied");
  if (access.status !== "authorized") throw new Error("Authentication service unavailable");
  return access;
}
