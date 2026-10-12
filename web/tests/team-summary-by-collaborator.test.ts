import { describe, expect, it, vi } from "vitest";
import { readTeamSummaryByCollaborator } from "../src/lib/metrics/read-team-summary-by-collaborator";
const id = "00000000-0000-4000-8000-000000009102", other = "00000000-0000-4000-8000-000000009103";
const counts = { attended: 3, locked: 2, kickstand: 1, repositioned: 0, invalid: 2 };
const zero = { attended: 0, locked: 0, kickstand: 0, repositioned: 0, invalid: 0 };
const row = { id, full_name: " Ana Pérez ", is_active: true, metrics: counts };
const data = { month: "2024-03-01", today: "2026-10-08", generated_at: "2026-10-08T12:00:00+00:00", employee_id: null, rows: [row, { id: other, full_name: "Luis", is_active: false, metrics: zero }], total_metrics: counts };
const filters = { month: "2024-03", employeeId: null };
function client(value: unknown = data, error: unknown = null) { const abort = vi.fn().mockResolvedValue({ data: value, error }); return { rpc: vi.fn(() => ({ abortSignal: abort })), abort }; }
describe("real activity by collaborator", () => {
  it("requests one grouped RPC with both filters and only sends required fields to the UI", async () => {
    const sdk = client({ ...data, secret: "private", rows: [{ ...row, email: "private@example.invalid", metrics: { ...counts, extra: "private" } }, data.rows[1]] });
    expect(await readTeamSummaryByCollaborator(sdk, filters)).toEqual({ status: "ready", data: { month: data.month, rows: [{ ...row, full_name: "Ana Pérez" }, data.rows[1]], total_metrics: counts } });
    expect(sdk.rpc).toHaveBeenCalledOnce(); expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_by_collaborator", { p_month: "2024-03-01", p_employee_id: null });
    expect(sdk.abort.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
  });
  it("accepts a selected collaborator and genuine zero counts", async () => {
    const selected = { ...data, employee_id: other, rows: [data.rows[1]], total_metrics: zero };
    expect(await readTeamSummaryByCollaborator(client(selected), { ...filters, employeeId: other })).toMatchObject({ status: "ready", data: { rows: [data.rows[1]], total_metrics: zero } });
  });
  it("accepts an empty team only with an actual zero total", async () => {
    expect(await readTeamSummaryByCollaborator(client({ ...data, rows: [], total_metrics: zero }), filters)).toMatchObject({ status: "ready", data: { rows: [] } });
    expect(await readTeamSummaryByCollaborator(client({ ...data, rows: [] }), filters)).toEqual({ status: "unavailable" });
  });
  it.each([
    null, { ...data, month: "2024-04-01" }, { ...data, today: "2026-02-30" },
    { ...data, generated_at: "invalid" }, { ...data, employee_id: id },
    { ...data, rows: [row, row], total_metrics: { attended: 6, locked: 4, kickstand: 2, repositioned: 0, invalid: 4 } },
    { ...data, rows: [{ ...row, id: "malformed" }] }, { ...data, rows: [{ ...row, full_name: " " }] },
    { ...data, rows: [{ ...row, is_active: "true" }] },
    { ...data, rows: [{ ...row, metrics: { ...counts, attended: -1 } }] },
    { ...data, rows: [{ ...row, metrics: { ...counts, locked: 4 } }] },
    { ...data, total_metrics: { ...counts, invalid: 1 } },
    { ...data, rows: [{ ...row, metrics: { ...counts, invalid: 1.5 } }] },
    { ...data, total_metrics: { ...counts, attended: Number.MAX_SAFE_INTEGER + 1 } },
  ])("rejects malformed, mismatched or inconsistent data", async (value) => {
    expect(await readTeamSummaryByCollaborator(client(value), filters)).toEqual({ status: "unavailable" });
  });
  it("rejects an unrelated or missing row for a person selection", async () => {
    for (const rows of [data.rows, [], [data.rows[1]]]) expect(await readTeamSummaryByCollaborator(client({ ...data, employee_id: id, rows }), { ...filters, employeeId: id })).toEqual({ status: "unavailable" });
  });
  it("keeps access revocation, invalid filters and service errors distinct", async () => {
    for (const [code, status] of [["42501", "denied"], ["22023", "invalid"], ["XX000", "unavailable"]]) expect(await readTeamSummaryByCollaborator(client(null, { code, message: "private SQL" }), filters)).toEqual({ status });
    const sdk = client(); sdk.abort.mockRejectedValue(new Error("network/token details"));
    expect(await readTeamSummaryByCollaborator(sdk, filters)).toEqual({ status: "unavailable" });
  });
});
