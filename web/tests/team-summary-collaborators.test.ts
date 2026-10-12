import { describe, expect, it, vi } from "vitest";
import { readTeamSummaryCollaborators } from "../src/lib/metrics/read-team-summary-collaborators";
const a = { id: "00000000-0000-4000-8000-000000009102", full_name: " Ana ", is_active: true };
const b = { id: "00000000-0000-4000-8000-000000009103", full_name: "Historical", is_active: false };
function client(data: unknown, error: unknown = null) { return { rpc: vi.fn(() => ({ abortSignal: vi.fn().mockResolvedValue({ data, error }) })) }; }
describe("authorized minimal collaborator reads", () => {
  it("preserves active/history IDs and exposes only selector fields", async () => {
    const sdk = client([{ ...a, email: "private@example.invalid" }, b]);
    expect(await readTeamSummaryCollaborators(sdk)).toEqual({ status: "ready", data: [{ ...a, full_name: "Ana" }, b] });
    expect(sdk.rpc).toHaveBeenCalledWith("read_team_summary_collaborators");
  });
  it.each([null, {}, [{ ...a, id: "invalid" }], [a, a], [{ ...a, full_name: " " }], [{ ...a, is_active: "true" }]])("rejects malformed rosters", async (data) => {
    expect(await readTeamSummaryCollaborators(client(data))).toEqual({ status: "unavailable" });
  });
  it("keeps access rejection distinct from provider failure", async () => {
    expect(await readTeamSummaryCollaborators(client(null, { code: "42501" }))).toEqual({ status: "denied" });
    expect(await readTeamSummaryCollaborators(client(null, { message: "private SQL" }))).toEqual({ status: "unavailable" });
  });
});
