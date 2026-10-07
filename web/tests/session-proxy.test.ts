import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { CookieMethodsServer } from "@supabase/ssr";

const hooks = vi.hoisted(() => ({ create: vi.fn(), claims: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: hooks.create }));
import { proxy } from "../src/proxy";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});

describe("SSR session refresh", () => {
  it("passes refreshed chunks to both the server request and browser response and prevents shared caching", async () => {
    const request = new NextRequest("http://localhost/activity", { headers: { cookie: "sb-auth.0=old" } });
    hooks.create.mockImplementation((_url, _key, options: { cookies: CookieMethodsServer }) => {
      hooks.claims.mockImplementation(async () => {
        expect(await options.cookies.getAll()).toEqual([{ name: "sb-auth.0", value: "old" }]);
        await options.cookies.setAll?.([
          { name: "sb-auth.0", value: "new-a", options: { httpOnly: true, sameSite: "lax", path: "/" } },
          { name: "sb-auth.1", value: "new-b", options: { httpOnly: true, sameSite: "lax", path: "/" } },
        ], { "Cache-Control": "private, no-store", "Pragma": "no-cache", "Expires": "0" });
        return { data: { claims: {} }, error: null };
      });
      return { auth: { getClaims: hooks.claims } };
    });
    const response = await proxy(request);
    expect(request.cookies.get("sb-auth.0")?.value).toBe("new-a");
    expect(request.cookies.get("sb-auth.1")?.value).toBe("new-b");
    expect(response.cookies.get("sb-auth.0")).toMatchObject({ value: "new-a", httpOnly: true, sameSite: "lax" });
    expect(response.cookies.get("sb-auth.1")?.value).toBe("new-b");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("expires")).toBe("0");
  });
  it("does not initialize a client when config is absent and still blocks shared caching", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const response = await proxy(new NextRequest("http://localhost/login"));
    expect(hooks.create).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
