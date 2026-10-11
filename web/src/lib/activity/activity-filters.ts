import { isUuid, type SummarySearchParams } from "../metrics/summary-filters";
export type ActivityFilters = { view: "day" | "month"; date: string; employeeId: string | null; query: string | null; validity: "all" | "valid" | "invalid"; offset: number; asOf: string | null };
export function activityToday(instant: string): string {
  const parts = new Intl.DateTimeFormat("en", {year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Europe/Dublin"}).formatToParts(new Date(instant));
  return ["year","month","day"].map(type=>parts.find(part=>part.type===type)!.value).join("-");
}
export function activityDate(value: unknown): value is string { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value; }
export function activityInstant(value: unknown): value is string { return typeof value==="string" && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)); }
export function parseActivityFilters(params: SummarySearchParams, instant: string): ActivityFilters | null {
  if (Object.values(params).some(value=>Array.isArray(value))) return null;
  const today=activityToday(instant), view=params.view??"day", validity=params.validity??"all";
  const date=params.date??(view==="month"?today.slice(0,7)+"-01":today);
  const employee=params.employee, query=typeof params.q==="string"?params.q.trim().toUpperCase():null;
  const offsetText=params.offset??"0", asOf=params.asOf??null;
  if ((view!=="day"&&view!=="month")||(validity!=="all"&&validity!=="valid"&&validity!=="invalid")||!activityDate(date)||date<"1900-01-01"||date>today||
    (view==="month"&&!date.endsWith("-01"))||(employee!==undefined&&!isUuid(employee))||
    (query && (!/^[A-Z0-9]+$/.test(query)||query.length>10))||typeof offsetText!=="string"||!/^\d+$/.test(offsetText)) return null;
  const offset=Number(offsetText);
  if (!Number.isSafeInteger(offset)||offset>2147483647||offset%25!==0||(offset>0&&!asOf)||
    (asOf!==null&&(!activityInstant(asOf)||Date.parse(asOf)>Date.parse(instant)||Date.parse(asOf)<Date.parse("1900-01-01T00:00:00Z")))) return null;
  return {view,date,employeeId:employee?.toLowerCase()??null,query:query||null,validity,offset,asOf};
}
export function activityHref(filters: ActivityFilters): string {
  const params=new URLSearchParams({view:filters.view,date:filters.date});
  if(filters.employeeId)params.set("employee",filters.employeeId);
  if(filters.query)params.set("q",filters.query);
  if(filters.validity!=="all")params.set("validity",filters.validity);
  if(filters.offset)params.set("offset",String(filters.offset));
  if(filters.asOf)params.set("asOf",filters.asOf);
  return `/activity?${params.toString()}`;
}
