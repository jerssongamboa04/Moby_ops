import { describe, expect, it } from "vitest";
import { parseSummaryFilters, currentDublinMonth } from "../src/lib/metrics/summary-filters";
const instant = "2026-10-07T18:00:00Z";
describe("server filter parsing", () => {
  it("defaults to the actual Dublin month and everyone", () => {
    expect(parseSummaryFilters({}, instant)).toEqual({ month: "2026-10", employeeId: null });
    expect(currentDublinMonth("2026-09-30T23:30:00Z")).toBe("2026-10");
    expect(currentDublinMonth("2026-11-30T23:30:00Z")).toBe("2026-11");
  });
  it("accepts historical periods and canonicalizes a UUID", () => {
    expect(parseSummaryFilters({ month: "2024-03", employee: "ABCD0000-0000-4000-8000-000000009102" }, instant)).toEqual({ month: "2024-03", employeeId: "abcd0000-0000-4000-8000-000000009102" });
  });
  it.each([{ month: "2026-11" }, { month: "1899-12" }, { month: "2026-00" }, { month: "2026-13" }, { month: "2026-10-01" }, { month: ["2026-10", "2026-09"] }, { employee: "not-a-uuid" }, { employee: ["00000000-0000-4000-8000-000000009102"] }, { employee: "" }])("rejects malformed, repeated or future filters", (params) => {
    expect(parseSummaryFilters(params, instant)).toBeNull();
  });
});
