import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  return {
    auth: { signInWithPassword: vi.fn(), signOut: vi.fn(), getUser: vi.fn() },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) })), maybeSingle,
  };
});
vi.mock("../src/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn(async () => sdk) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { signInAction, signOutAction } from "../src/app/login/actions";
import Home from "../src/app/page";
import Activity from "../src/app/activity/page";
import { createSupabaseServerClient } from "../src/lib/supabase/server";

function credentials(email = " supervisor@example.invalid ", password = " example-password ") {
  const form = new FormData(); form.set("email", email); form.set("password", password); return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  sdk.auth.signInWithPassword.mockResolvedValue({ error: null });
  sdk.auth.signOut.mockResolvedValue({ error: null });
  sdk.auth.getUser.mockResolvedValue({ data: { user: { id: "verified-user" } }, error: null });
  sdk.maybeSingle.mockResolvedValue({ data: { full_name: "Jersson Gamboa", role: "supervisor", is_active: true }, error: null });
});

describe("web sign-in and session controls", () => {
  it("signs in, preserves password whitespace and redirects only after authorization", async () => {
    await expect(signInAction({}, credentials())).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/;307;" });
    expect(sdk.auth.signInWithPassword).toHaveBeenCalledWith({ email: "supervisor@example.invalid", password: " example-password " });
    expect(sdk.auth.getUser).toHaveBeenCalled();
    expect(createSupabaseServerClient).toHaveBeenCalledWith({ writable: true });
  });
  it("rejects malformed inputs before calling Auth", async () => {
    expect(await signInAction({}, credentials("invalid", ""))).toEqual({ error: "invalid" });
    expect(sdk.auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it("uses a generic credential error rather than revealing account details", async () => {
    sdk.auth.signInWithPassword.mockResolvedValue({ error: { status: 400, message: "private account details" } });
    expect(await signInAction({}, credentials())).toEqual({ error: "credentials" });
    expect(sdk.auth.getUser).not.toHaveBeenCalled();
  });
  it("clears the new web session for an employee without signing out the mobile app", async () => {
    sdk.maybeSingle.mockResolvedValue({ data: { full_name: "Employee", role: "employee", is_active: true }, error: null });
    expect(await signInAction({}, credentials())).toEqual({ error: "denied" });
    expect(sdk.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("reports a service failure and clears the new session after a failed profile query", async () => {
    sdk.maybeSingle.mockResolvedValue({ data: null, error: { message: "private SQL details" } });
    expect(await signInAction({}, credentials())).toEqual({ error: "unavailable" });
    expect(sdk.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("does not pretend sign-out succeeded when the provider reports an error", async () => {
    sdk.auth.signOut.mockResolvedValue({ error: { message: "private token details" } });
    expect(await signOutAction({})).toEqual({ error: "unavailable" });
  });
  it("ends only the current session and redirects to login", async () => {
    await expect(signOutAction({})).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/login;307;" });
    expect(sdk.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("does not call Supabase when the publishable configuration is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(await signInAction({}, credentials())).toEqual({ error: "configuration" });
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });
});

describe("protected server pages", () => {
  it.each([Home, Activity])("rejects direct page access without a verified identity", async (Page) => {
    sdk.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(Page()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/login;307;" });
    expect(sdk.from).not.toHaveBeenCalled();
  });
  it.each([Home, Activity])("rejects an inactive supervisor on each page", async (Page) => {
    sdk.maybeSingle.mockResolvedValue({ data: { full_name: "A", role: "supervisor", is_active: false }, error: null });
    await expect(Page()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/access-denied;307;" });
  });
  it("passes the real database name to the Summary shell", async () => {
    const page = await Home();
    expect(page.props.fullName).toBe("Jersson Gamboa");
    expect(page.props.page).toBe("summary");
  });
});
