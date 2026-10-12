import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  return {
    rpc: vi.fn(() => ({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: null }) })),
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
    expect(sdk.rpc).not.toHaveBeenCalled();
  });
  it.each([Home, Activity])("rejects an inactive supervisor on each page", async (Page) => {
    sdk.maybeSingle.mockResolvedValue({ data: { full_name: "A", role: "supervisor", is_active: false }, error: null });
    await expect(Page()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/access-denied;307;" });
  });
  it("passes the real database name to the Summary shell", async () => {
    const page = await Home();
    expect(page.props.fullName).toBe("Jersson Gamboa");
    expect(page.props.page).toBe("summary");
    expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_metrics_filtered", expect.objectContaining({ p_employee_id: null }));
    expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_collaborators");
    expect(page.props.children.props.result).toEqual({ status: "unavailable" });
  });
});

it("rejects malformed URL filters after authentication and before any metric/list RPC", async () => {
  const page = await Home({ searchParams: Promise.resolve({ employee: "malicious-input" }) });
  expect(page.props.children.props.filters).toBeNull();
  expect(sdk.rpc).not.toHaveBeenCalled();
});
it("passes the selected historical month and canonical collaborator to PostgreSQL", async () => {
  const id = "00000000-0000-4000-8000-000000009102";
  const page = await Home({ searchParams: Promise.resolve({ month: "2024-03", employee: id }) });
  expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_metrics_filtered", { p_month: "2024-03-01", p_employee_id: id });
  expect(page.props.children.props.filters).toEqual({ month: "2024-03", employeeId: id });
});

it("redirects when SQL authorization is revoked after the profile check", async () => {
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: { code: "42501" } }) });
  await expect(Home()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/access-denied;307;" });
});

it("passes the chart failure independently to the protected Summary panel", async () => {
  const page = await Home();
  expect(page.props.children.props.chart).toEqual({ status: "unavailable" });
});

it("rejects access if authorization is revoked during a previous-month read", async () => {
  const counts = { attended: 2, locked: 1, kickstand: 1, repositioned: 1, invalid: 1 };
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: {
    month: "2024-10-01", today: "2026-10-08", generated_at: "2026-10-08T12:00:00Z", employee_id: null,
    month_metrics: counts, today_metrics: counts,
  }, error: null }) });
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }) });
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: null }) }); // table response, independent from chart
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: { code: "42501" } }) });
  await expect(Home({ searchParams: Promise.resolve({ month: "2024-10" }) })).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/access-denied;307;" });
});


it("passes the same filters to the table RPC and keeps a table failure independent", async () => {
  const id = "00000000-0000-4000-8000-000000009102";
  const page = await Home({ searchParams: Promise.resolve({ month: "2024-03", employee: id }) });
  expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_by_collaborator", { p_month: "2024-03-01", p_employee_id: id });
  expect(page.props.children.props.activity).toEqual({ status: "unavailable" });
});
it("redirects if the collaborator table read rejects authorization", async () => {
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: null }) });
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }) });
  sdk.rpc.mockReturnValueOnce({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: { code: "42501" } }) });
  await expect(Home()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/access-denied;307;" });
});


it("rejects malformed Activity filters after verifying identity and before RPC reads", async () => {
  const page=await Activity({searchParams:Promise.resolve({date:"2026-02-30"})});
  expect(page.props.children.props.filters).toBeNull();expect(sdk.rpc).not.toHaveBeenCalled();
});
it("passes the complete Activity filters to the SQL list and keeps genuine errors explicit", async () => {
  const id="00000000-0000-4000-8000-000000009402";
  const page=await Activity({searchParams:Promise.resolve({view:"month",date:"2024-03-01",employee:id,q:"h02911",validity:"invalid"})});
  expect(sdk.rpc).toHaveBeenCalledWith("read_team_activity",{p_view:"month",p_date:"2024-03-01",p_employee_id:id,p_bike_query:"H02911",p_validity:"invalid",p_offset:0,p_as_of:null});
  expect(page.props.children.props.result).toEqual({status:"unavailable"});
});
it("rejects access when activity permission is revoked during the list read", async () => {
  sdk.rpc.mockReturnValueOnce({abortSignal:vi.fn().mockResolvedValue({data:null,error:{code:"42501"}})});
  await expect(Activity()).rejects.toMatchObject({digest:"NEXT_REDIRECT;replace;/access-denied;307;"});
});
