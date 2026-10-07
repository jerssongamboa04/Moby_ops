import { describe, expect, it, vi } from "vitest";
import { readTeamSummaryMetrics } from "../src/lib/metrics/read-team-summary-metrics";
const payload = { month: "2026-10-01", today: "2026-10-07", generated_at: "2026-10-07T18:00:00+00:00", month_metrics: { attended: 10, locked: 8, kickstand: 6, repositioned: 4, invalid: 2 }, today_metrics: { attended: 3, locked: 2, kickstand: 1, repositioned: 0, invalid: 1 } };
function client(data: unknown = payload, error: unknown = null) {
  const abortSignal = vi.fn().mockResolvedValue({ data, error });
  return { rpc: vi.fn(() => ({ abortSignal })), abortSignal };
}
describe("authorized team metric reads", () => {
  it("requests the current month from the RPC and preserves separate monthly/today totals", async () => {
    const sdk = client();
    expect(await readTeamSummaryMetrics(sdk)).toEqual({ status: "ready", data: payload });
    expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_metrics");
    expect(sdk.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
  });
  it("accepts a genuine empty month", async () => {
    const zero = { attended: 0, locked: 0, kickstand: 0, repositioned: 0, invalid: 0 };
    const data = { ...payload, month_metrics: zero, today_metrics: zero };
    expect(await readTeamSummaryMetrics(client(data))).toEqual({ status: "ready", data });
  });
  it.each([null, { ...payload, month: "2026-02-30" }, { ...payload, generated_at: "bad" }, { ...payload, month_metrics: { ...payload.month_metrics, attended: -1 } }, { ...payload, today_metrics: { ...payload.today_metrics, locked: 4 } }, { ...payload, month_metrics: { ...payload.month_metrics, invalid: 1.5 } }])("rejects malformed payloads without substituting zero totals", async (data) => {
    expect(await readTeamSummaryMetrics(client(data))).toEqual({ status: "unavailable" });
  });
  it("keeps authorization failures distinct and returns no counts", async () => {
    expect(await readTeamSummaryMetrics(client(payload, { code: "42501" }))).toEqual({ status: "denied" });
  });
  it("hides provider errors and handles network failures", async () => {
    expect(await readTeamSummaryMetrics(client(payload, { message: "private SQL" }))).toEqual({ status: "unavailable" });
    const sdk = client(); sdk.abortSignal.mockRejectedValue(new Error("private token"));
    expect(await readTeamSummaryMetrics(sdk)).toEqual({ status: "unavailable" });
  });
});
