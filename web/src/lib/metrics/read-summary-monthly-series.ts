import { readTeamSummaryMetrics, type SummaryResult } from "./read-team-summary-metrics";
import type { SummaryFilters } from "./summary-filters";
export type MonthlySeries = {
  month: string; today: string;
  entries: { month: string; valid: number; invalid: number; inProgress: boolean }[];
};
export type MonthlySeriesResult = { status: "ready"; data: MonthlySeries } | { status: "unavailable" | "denied" | "invalid" };

// Compose only validated aggregates; the selected month is shared with the cards.
export async function readSummaryMonthlySeries(client: Parameters<typeof readTeamSummaryMetrics>[0], filters: SummaryFilters, selected: SummaryResult): Promise<MonthlySeriesResult> {
  if (selected.status !== "ready") return { status: selected.status };
  const [year, month] = filters.month.split("-").map(Number);
  const selectedIndex = year * 12 + month - 1;
  const months = Array.from({ length: Math.min(4, selectedIndex - 1900 * 12 + 1) }, (_, i) => {
    const index = selectedIndex - Math.min(3, selectedIndex - 1900 * 12) + i;
    return `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, "0")}`;
  });
  const previous = await Promise.all(months.slice(0, -1).map((month) => readTeamSummaryMetrics(client, { ...filters, month })));
  const results = [...previous, selected];
  if (results.some((result) => result.status === "denied")) return { status: "denied" };
  if (results.some((result) => result.status === "invalid")) return { status: "invalid" };
  if (results.some((result) => result.status !== "ready" || result.data.today !== selected.data.today)) return { status: "unavailable" };
  const entries: MonthlySeries["entries"] = [];
  for (const result of results) {
    if (result.status !== "ready") return { status: "unavailable" };
    entries.push({ month: result.data.month, valid: result.data.month_metrics.attended, invalid: result.data.month_metrics.invalid,
      inProgress: result.data.month.slice(0, 7) === selected.data.today.slice(0, 7) });
  }
  return { status: "ready", data: { month: selected.data.month, today: selected.data.today, entries } };
}
