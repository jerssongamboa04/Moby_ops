import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

// Request-scoped client. Importing next/headers prevents use in Client Components.
export async function createSupabaseServerClient({ writable = false }: { writable?: boolean } = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase configuration unavailable");
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(values) {
        // Pages are read-only. Proxy handles refresh; Actions must propagate writes.
        if (writable) for (const { name, value, options } of values) cookieStore.set(name, value, options);
      },
    },
  });
}
