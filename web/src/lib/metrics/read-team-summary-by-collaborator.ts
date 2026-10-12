import type { Counts } from "./read-team-summary-metrics";
import { currentDublinMonth, isUuid, type SummaryFilters } from "./summary-filters";
export type CollaboratorActivity = { id: string; full_name: string; is_active: boolean; metrics: Counts };
export type CollaboratorSummary = { month: string; rows: CollaboratorActivity[]; total_metrics: Counts };
export type CollaboratorSummaryResult = { status: "ready"; data: CollaboratorSummary } | { status: "unavailable" | "denied" | "invalid" };
type RpcClient = { rpc(name: "read_team_summary_by_collaborator", params: { p_month: string; p_employee_id: string | null }): { abortSignal(signal: AbortSignal): PromiseLike<{ data: unknown; error: { code?: string } | null }> } };
const keys = ["attended", "locked", "kickstand", "repositioned", "invalid"] as const;
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function date(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function counts(value: unknown): Counts | null {
  if (!record(value) || !keys.every((key) => Number.isSafeInteger(value[key]) && (value[key] as number) >= 0) ||
    !["locked", "kickstand", "repositioned"].every((key) => (value[key] as number) <= (value.attended as number))) return null;
  return { attended: value.attended as number, locked: value.locked as number, kickstand: value.kickstand as number,
    repositioned: value.repositioned as number, invalid: value.invalid as number };
}
function parse(value: unknown, filters: SummaryFilters): CollaboratorSummary | null {
  if (!record(value) || !date(value.month) || value.month !== filters.month + "-01" || !date(value.today) ||
    value.month < "1900-01-01" || value.month.slice(0, 7) > value.today.slice(0, 7) ||
    value.employee_id !== filters.employeeId || typeof value.generated_at !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value.generated_at) || !Number.isFinite(Date.parse(value.generated_at)) ||
    currentDublinMonth(value.generated_at) !== value.today.slice(0, 7) || !Array.isArray(value.rows)) return null;
  const total = counts(value.total_metrics);
  if (!total) return null;
  const ids = new Set<string>(), rows: CollaboratorActivity[] = [];
  const sums: Counts = { attended: 0, locked: 0, kickstand: 0, repositioned: 0, invalid: 0 };
  for (const row of value.rows) {
    if (!record(row) || !isUuid(row.id) || ids.has(row.id.toLowerCase()) || typeof row.full_name !== "string" ||
      !row.full_name.trim() || typeof row.is_active !== "boolean" || (filters.employeeId && row.id !== filters.employeeId)) return null;
    const metrics = counts(row.metrics);
    if (!metrics) return null;
    ids.add(row.id.toLowerCase());
    rows.push({ id: row.id, full_name: row.full_name.trim(), is_active: row.is_active, metrics });
    for (const key of keys) sums[key] += metrics[key];
  }
  if ((filters.employeeId && rows.length !== 1) || !keys.every((key) => Number.isSafeInteger(sums[key]) && sums[key] === total[key])) return null;
  return { month: value.month, rows, total_metrics: total };
}
// Server-only call site: the request-scoped authenticated client, never an admin key.
export async function readTeamSummaryByCollaborator(client: RpcClient, filters: SummaryFilters): Promise<CollaboratorSummaryResult> {
  try {
    const { data, error } = await client.rpc("read_team_summary_by_collaborator", { p_month: filters.month + "-01", p_employee_id: filters.employeeId }).abortSignal(AbortSignal.timeout(10000));
    if (error) return { status: error.code === "42501" ? "denied" : error.code === "22023" ? "invalid" : "unavailable" };
    const parsed = parse(data, filters);
    return parsed ? { status: "ready", data: parsed } : { status: "unavailable" };
  } catch { return { status: "unavailable" }; }
}
