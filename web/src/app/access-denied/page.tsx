import { redirect } from "next/navigation";
import { AccessDenied } from "../../components/access-denied";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { readSupervisorAccess } from "../../lib/auth/access";

export const dynamic = "force-dynamic";
export default async function Denied() {
  if (!getSupabaseConfig()) redirect("/login");
  const access = await readSupervisorAccess(await createSupabaseServerClient());
  if (access.status === "anonymous") redirect("/login");
  if (access.status === "authorized") redirect("/");
  if (access.status === "unavailable") throw new Error("Authentication service unavailable");
  return <AccessDenied />;
}
