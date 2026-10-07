import { redirect } from "next/navigation";
import { LoginForm } from "../../components/login-form";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { readSupervisorAccess } from "../../lib/auth/access";
import { signInAction } from "./actions";

export const dynamic = "force-dynamic";
export default async function Login() {
  const configured = Boolean(getSupabaseConfig());
  if (configured) {
    const access = await readSupervisorAccess(await createSupabaseServerClient());
    if (access.status === "authorized") redirect("/");
  }
  return <LoginForm action={signInAction} configured={configured} />;
}
