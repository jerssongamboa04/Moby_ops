import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { readSupervisorAccess } from "../src/lib/auth/access";

function client(profile: unknown, options: { user?: boolean; authError?: unknown; profileError?: unknown } = {}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error: options.profileError ?? null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  const getUser = vi.fn().mockResolvedValue({ data: { user: options.user === false ? null : { id: "verified-user" } }, error: options.authError ?? null });
  return { sdk: { auth: { getUser }, from } as unknown as SupabaseClient, getUser, from, eq };
}

describe("server supervisor access", () => {
  it("uses a verified Auth identity and the matching database profile", async () => {
    const c = client({ full_name: "Jersson Gamboa", role: "supervisor", is_active: true });
    expect(await readSupervisorAccess(c.sdk)).toEqual({ status: "authorized", id: "verified-user", fullName: "Jersson Gamboa" });
    expect(c.getUser).toHaveBeenCalledOnce();
    expect(c.from).toHaveBeenCalledWith("profiles");
    expect(c.eq).toHaveBeenCalledWith("id", "verified-user");
  });
  it.each([
    { full_name: "A", role: "employee", is_active: true },
    { full_name: "A", role: "supervisor", is_active: false },
    { full_name: "A", role: "manager", is_active: true },
    null,
  ])("denies profiles without current supervisor authorization: %j", async (profile) => {
    expect(await readSupervisorAccess(client(profile).sdk)).toEqual({ status: "denied" });
  });
  it("does not query profiles for an absent identity", async () => {
    const c = client(null, { user: false });
    expect(await readSupervisorAccess(c.sdk)).toEqual({ status: "anonymous" });
    expect(c.from).not.toHaveBeenCalled();
  });
  it("does not convert a profile query failure into authorized or empty data", async () => {
    expect(await readSupervisorAccess(client(null, { profileError: { message: "private database detail" } }).sdk)).toEqual({ status: "unavailable" });
  });
  it("treats an invalid or revoked refresh token as signed out, without querying profiles", async () => {
    const c = client(null, { authError: { status: 400, code: "refresh_token_not_found" } });
    expect(await readSupervisorAccess(c.sdk)).toEqual({ status: "anonymous" });
    expect(c.from).not.toHaveBeenCalled();
  });
  it("fails closed on an Auth outage", async () => {
    const c = client(null, { authError: { status: 503 } });
    expect(await readSupervisorAccess(c.sdk)).toEqual({ status: "unavailable" });
    expect(c.from).not.toHaveBeenCalled();
  });
});
