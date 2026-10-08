import type { SummaryFilters } from "./summary-filters";
export type Counts = { attended: number; locked: number; kickstand: number; repositioned: number; invalid: number };
export type TeamSummary = { employee_id: string | null; month: string; today: string; generated_at: string; month_metrics: Counts; today_metrics: Counts };
export type SummaryResult = { status: "ready"; data: TeamSummary } | { status: "unavailable" } | { status: "denied" } | { status: "invalid" };
type RpcClient = { rpc(name: "read_team_summary_metrics_filtered", params: { p_month: string | null; p_employee_id: string | null }): { abortSignal(signal: AbortSignal): PromiseLike<{ data: unknown; error: { code?: string } | null }> } };
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function date(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function counts(value: unknown): value is Counts {
  if (!record(value)) return false;
  const keys = ["attended", "locked", "kickstand", "repositioned", "invalid"] as const;
  if (!keys.every((key) => Number.isSafeInteger(value[key]) && (value[key] as number) >= 0)) return false;
  return ["locked", "kickstand", "repositioned"].every((key) => (value[key] as number) <= (value.attended as number));
}
function summary(value: unknown, filters?: SummaryFilters): value is TeamSummary {
  if (!record(value) || !date(value.month) || !value.month.endsWith("-01") || !date(value.today) ||
    value.month !== (filters ? filters.month : value.today.slice(0, 7)) + "-01" ||
    value.month.slice(0, 7) > value.today.slice(0, 7) || value.employee_id !== (filters?.employeeId ?? null) || typeof value.generated_at !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value.generated_at) || !Number.isFinite(Date.parse(value.generated_at)) ||
    !counts(value.month_metrics) || !counts(value.today_metrics)) return false;
  const monthly = value.month_metrics, daily = value.today_metrics;
  return value.month.slice(0, 7) !== value.today.slice(0, 7) || (["attended", "locked", "kickstand", "repositioned", "invalid"] as const).every((key) => daily[key] <= monthly[key]);
}
// Called by a protected Server Component, using the request's authenticated client.
export async function readTeamSummaryMetrics(client: RpcClient, filters?: SummaryFilters): Promise<SummaryResult> {
  try {
    const { data, error } = await client.rpc("read_team_summary_metrics_filtered", { p_month: filters ? filters.month + "-01" : null, p_employee_id: filters?.employeeId ?? null }).abortSignal(AbortSignal.timeout(10000));
    if (error) return { status: error.code === "42501" ? "denied" : error.code === "22023" ? "invalid" : "unavailable" };
    return summary(data, filters) ? { status: "ready", data } : { status: "unavailable" };
  } catch { return { status: "unavailable" }; }
}
