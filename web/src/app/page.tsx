import { readTeamSummaryByCollaborator } from "../lib/metrics/read-team-summary-by-collaborator";
import { readSummaryMonthlySeries } from "../lib/metrics/read-summary-monthly-series";
import { redirect } from "next/navigation";
import { SummaryPanel } from "../components/summary-panel";
import { readTeamSummaryMetrics } from "../lib/metrics/read-team-summary-metrics";
import { readTeamSummaryCollaborators } from "../lib/metrics/read-team-summary-collaborators";
import { currentDublinMonth, parseSummaryFilters, type SummarySearchParams } from "../lib/metrics/summary-filters";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { DashboardShell } from "../components/dashboard-shell";
import { requireSupervisor } from "../lib/auth/require-supervisor";

export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams?: Promise<SummarySearchParams> } = {}) {
  const profile = await requireSupervisor();
  const instant = new Date().toISOString();
  const filters = parseSummaryFilters(await searchParams ?? {}, instant);
  const currentMonth = currentDublinMonth(instant);
  if (!filters) return <DashboardShell page="summary" fullName={profile.fullName} summaryInstant={instant}>
    <SummaryPanel filters={null} currentMonth={currentMonth} collaborators={null} result={{ status: "invalid" }} />
  </DashboardShell>;
  const client = await createSupabaseServerClient();
  const [result, collaborators, activity] = await Promise.all([
    readTeamSummaryMetrics(client, filters), readTeamSummaryCollaborators(client), readTeamSummaryByCollaborator(client, filters),
  ]);
  if (result.status === "denied" || collaborators.status === "denied" || activity.status === "denied") redirect("/access-denied");
  const chart = await readSummaryMonthlySeries(client, filters, result);
  if (chart.status === "denied") redirect("/access-denied");
  return <DashboardShell page="summary" fullName={profile.fullName} summaryInstant={result.status === "ready" ? result.data.generated_at : instant}>
    <SummaryPanel filters={filters} currentMonth={currentMonth} collaborators={collaborators} result={result} chart={chart} activity={activity} />
  </DashboardShell>;
}
