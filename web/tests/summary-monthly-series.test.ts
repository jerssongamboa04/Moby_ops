import { describe, expect, it, vi } from "vitest";
import { readSummaryMonthlySeries } from "../src/lib/metrics/read-summary-monthly-series";
const id = "00000000-0000-4000-8000-000000009102";
const counts = { attended: 2, locked: 1, kickstand: 1, repositioned: 1, invalid: 1 };
function data(month: string, today = "2026-10-08") { return { month, today, generated_at: "2026-10-08T12:00:00Z", employee_id: id, month_metrics: counts, today_metrics: counts }; }
function client() {
  return { rpc: vi.fn((_name, params) => ({ abortSignal: vi.fn().mockResolvedValue({ data: data(params.p_month), error: null }) })) };
}
describe("monthly chart from existing authorized aggregates", () => {
  it("keeps chronological months, person filter and the exact selected card totals without reading them again", async () => {
    const sdk = client(); const selected = data("2026-10-01");
    const result = await readSummaryMonthlySeries(sdk, { month: "2026-10", employeeId: id }, { status: "ready", data: selected });
    expect(sdk.rpc.mock.calls.map((call) => call[1])).toEqual(["07", "08", "09"].map((month) => ({ p_month: `2026-${month}-01`, p_employee_id: id })));
    expect(result).toEqual({ status: "ready", data: { month: "2026-10-01", today: "2026-10-08", entries: ["07", "08", "09", "10"].map((month) => ({ month: `2026-${month}-01`, valid: 2, invalid: 1, inProgress: month === "10" })) } });
  });
  it("handles year boundaries and does not mark historical months in progress", async () => {
    const sdk = client();
    const result = await readSummaryMonthlySeries(sdk, { month: "2026-01", employeeId: id }, { status: "ready", data: data("2026-01-01") });
    expect(result.status).toBe("ready");
    if (result.status === "ready") expect(result.data.entries.map((entry) => [entry.month, entry.inProgress])).toEqual([["2025-10-01", false], ["2025-11-01", false], ["2025-12-01", false], ["2026-01-01", false]]);
  });
  it("keeps the lower month limit and does not query unsupported years", async () => {
    const sdk = client();
    const result = await readSummaryMonthlySeries(sdk, { month: "1900-01", employeeId: id }, { status: "ready", data: data("1900-01-01") });
    expect(sdk.rpc).not.toHaveBeenCalled();
    if (result.status === "ready") expect(result.data.entries).toHaveLength(1);
  });
  it.each(["unavailable", "denied", "invalid"] as const)("propagates %s for the selected month without extra reads", async (status) => {
    const sdk = client(); expect(await readSummaryMonthlySeries(sdk, { month: "2026-10", employeeId: id }, { status })).toEqual({ status });
    expect(sdk.rpc).not.toHaveBeenCalled();
  });
  it.each([["42501", "denied"], ["22023", "invalid"], ["network", "unavailable"]])("rejects partial series after error %s", async (code, status) => {
    const sdk = { rpc: vi.fn(() => ({ abortSignal: vi.fn().mockResolvedValue({ data: null, error: { code } }) })) };
    expect(await readSummaryMonthlySeries(sdk, { month: "2026-10", employeeId: id }, { status: "ready", data: data("2026-10-01") })).toEqual({ status });
  });
  it("does not combine results spanning different Dublin dates", async () => {
    const sdk = { rpc: vi.fn((_name, params) => ({ abortSignal: vi.fn().mockResolvedValue({ data: data(params.p_month, "2026-10-09"), error: null }) })) };
    expect(await readSummaryMonthlySeries(sdk, { month: "2026-10", employeeId: id }, { status: "ready", data: data("2026-10-01") })).toEqual({ status: "unavailable" });
  });
});
