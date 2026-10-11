import { expect, it } from "vitest";
import { parseActivityFilters } from "../src/lib/activity/activity-filters";
const instant = "2026-10-11T23:30:00Z";
it("defaults to the actual Dublin day and all collaborators/validity", () => {
  expect(parseActivityFilters({}, instant)).toEqual({ view: "day", date: "2026-10-12", employeeId: null, query: null, validity: "all", offset: 0, asOf: null });
});
it("normalizes search and accepts an explicit monthly period", () => {
  expect(parseActivityFilters({ view: "month", date: "2024-03-01", q: " h02911 ", validity: "invalid" }, instant)).toMatchObject({ view: "month", date: "2024-03-01", query: "H02911", validity: "invalid" });
});
it.each([{date:"2026-02-30"},{date:"2026-10-13"},{view:"month",date:"2024-03-02"},{view:"bad"},{q:"%"},{q:"ABCDEFGHIJK"},{employee:"malicious"},{validity:"other"},{offset:"1"},{offset:"25"},{date:["2024-03-01","2024-04-01"]},{asOf:"infinity"}])("rejects invalid URL inputs before any query", (params) => {
  expect(parseActivityFilters(params, instant)).toBeNull();
});
it("accepts a bounded page only with a finite server cutoff", () => {
  expect(parseActivityFilters({ offset:"25",asOf:"2026-10-11T20:00:00+00:00" },instant)).toMatchObject({ offset:25,asOf:"2026-10-11T20:00:00+00:00" });
});
