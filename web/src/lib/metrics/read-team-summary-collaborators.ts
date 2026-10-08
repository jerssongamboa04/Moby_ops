import { isUuid } from "./summary-filters";
export type Collaborator = { id: string; full_name: string; is_active: boolean };
export type CollaboratorResult = { status: "ready"; data: Collaborator[] } | { status: "unavailable" } | { status: "denied" };
type RpcClient = { rpc(name: "read_team_summary_collaborators"): { abortSignal(signal: AbortSignal): PromiseLike<{ data: unknown; error: { code?: string } | null }> } };
function roster(value: unknown): value is Collaborator[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every((p) => {
    if (typeof p !== "object" || p === null || !isUuid(p.id) || ids.has(p.id) ||
      typeof p.full_name !== "string" || !p.full_name.trim() || typeof p.is_active !== "boolean") return false;
    ids.add(p.id); return true;
  });
}
export async function readTeamSummaryCollaborators(client: RpcClient): Promise<CollaboratorResult> {
  try {
    const { data, error } = await client.rpc("read_team_summary_collaborators").abortSignal(AbortSignal.timeout(10000));
    if (error) return { status: error.code === "42501" ? "denied" : "unavailable" };
    // Only the selector's fields cross the server/client boundary.
    return roster(data) ? { status: "ready", data: data.map(({ id, full_name, is_active }) => ({ id, full_name: full_name.trim(), is_active })) } : { status: "unavailable" };
  } catch { return { status: "unavailable" }; }
}
