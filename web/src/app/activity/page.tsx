import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { ActivityPanel } from "../../components/activity-panel";
import { requireSupervisor } from "../../lib/auth/require-supervisor";
import { activityToday, parseActivityFilters } from "../../lib/activity/activity-filters";
import { readTeamActivity } from "../../lib/activity/read-team-activity";
import { readTeamSummaryCollaborators } from "../../lib/metrics/read-team-summary-collaborators";
import type { SummarySearchParams } from "../../lib/metrics/summary-filters";
import { createSupabaseServerClient } from "../../lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Activity({searchParams}:{searchParams?:Promise<SummarySearchParams>}={}){
  const profile=await requireSupervisor(),instant=new Date().toISOString(),today=activityToday(instant);
  const filters=parseActivityFilters(await searchParams??{},instant);
  if(!filters)return <DashboardShell page="activity" fullName={profile.fullName} activityInstant={instant}><ActivityPanel filters={null} today={today} result={{status:"invalid"}} collaborators={null}/></DashboardShell>;
  const client=await createSupabaseServerClient();
  const [result,collaborators]=await Promise.all([readTeamActivity(client,filters),readTeamSummaryCollaborators(client)]);
  if(result.status==="denied"||collaborators.status==="denied")redirect("/access-denied");
  return <DashboardShell page="activity" fullName={profile.fullName} activityInstant={instant}><ActivityPanel key={JSON.stringify(filters)} filters={filters} today={today} result={result} collaborators={collaborators}/></DashboardShell>;
}
