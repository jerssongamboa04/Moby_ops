export type SummaryFilters = { month: string; employeeId: string | null };
export type SummarySearchParams = Record<string, string | string[] | undefined>;
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
export function currentDublinMonth(instant: string): string {
  const parts = new Intl.DateTimeFormat("en", { year: "numeric", month: "2-digit", timeZone: "Europe/Dublin" }).formatToParts(new Date(instant));
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
}
export function parseSummaryFilters(params: SummarySearchParams, instant: string): SummaryFilters | null {
  const current = currentDublinMonth(instant);
  const month = params.month ?? current;
  const employee = params.employee;
  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < "1900-01" || month > current ||
    (employee !== undefined && !isUuid(employee))) return null;
  return { month, employeeId: employee?.toLowerCase() ?? null };
}
