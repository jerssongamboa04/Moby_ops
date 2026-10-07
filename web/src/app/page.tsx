import { SummaryMetrics } from "../components/summary-metrics";
import { readTeamSummaryMetrics } from "../lib/metrics/read-team-summary-metrics";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { DashboardShell } from "../components/dashboard-shell";
import { requireSupervisor } from "../lib/auth/require-supervisor";

export const dynamic = "force-dynamic";
export default async function Home() {
  const profile = await requireSupervisor();
  const result = await readTeamSummaryMetrics(await createSupabaseServerClient());
  return <DashboardShell page="summary" fullName={profile.fullName} summaryInstant={result.status === "ready" ? result.data.generated_at : new Date().toISOString()}><SummaryMetrics result={result} /></DashboardShell>;
}
