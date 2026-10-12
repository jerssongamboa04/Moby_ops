import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseConfig } from "../src/lib/supabase/config";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});

describe("web Supabase configuration", () => {
  it("accepts the public project configuration", () => {
    expect(getSupabaseConfig()).toEqual({ url: "https://example.supabase.co", key: "sb_publishable_test" });
  });
  it.each(["", "sb_secret_test", "legacy-or-admin-key"])("rejects a missing or non-publishable key: %s", (key) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
    expect(getSupabaseConfig()).toBeNull();
  });
  it.each(["not-a-url", "http://example.supabase.co", "https://user:password@example.supabase.co"])("rejects invalid or unsafe project URLs: %s", (url) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    expect(getSupabaseConfig()).toBeNull();
  });
  it("permits HTTP only for local development loopback", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    expect(getSupabaseConfig()?.url).toBe("http://127.0.0.1:54321");
  });
});
