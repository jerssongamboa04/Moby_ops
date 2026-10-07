import { DashboardShell } from "../../components/dashboard-shell";
import { requireSupervisor } from "../../lib/auth/require-supervisor";

export const dynamic = "force-dynamic";
export default async function Activity() {
  const profile = await requireSupervisor();
  return <DashboardShell page="activity" fullName={profile.fullName} />;
}
