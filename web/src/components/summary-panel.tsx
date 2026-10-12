"use client";
import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SummaryFilterPicker, SummaryMonthOptions } from "./summary-filter-picker";
import { SummaryMonthlyChart } from "./summary-monthly-chart";
import type { MonthlySeriesResult } from "../lib/metrics/read-summary-monthly-series";
import { SummaryCollaboratorTable } from "./summary-collaborator-table";
import type { CollaboratorSummaryResult } from "../lib/metrics/read-team-summary-by-collaborator";
import { SummaryMetrics } from "./summary-metrics";
import type { SummaryResult } from "../lib/metrics/read-team-summary-metrics";
import type { CollaboratorResult } from "../lib/metrics/read-team-summary-collaborators";
import type { SummaryFilters } from "../lib/metrics/summary-filters";

export function SummaryPanel({ filters, currentMonth, collaborators, result, chart, activity }: {
  filters: SummaryFilters | null; currentMonth: string; collaborators: CollaboratorResult | null; result: SummaryResult; chart?: MonthlySeriesResult; activity?: CollaboratorSummaryResult;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const locale = i18n.language === "en" ? "en-IE" : "es-ES";
  if (!filters) return <section className="summary-filter-error"><p role="alert">{t("filtersInvalid")}</p><Link href="/">{t("filtersReset")}</Link></section>;
  const people = collaborators?.status === "ready" ? collaborators.data : [];
  const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "Europe/Dublin" }).formatToParts(new Date(filters.month + "-01T12:00:00Z")).filter((part) => part.type === "month" || part.type === "year").map((part) => part.value).join(" ");
  function change(next: SummaryFilters) {
    const params = new URLSearchParams({ month: next.month });
    if (next.employeeId) params.set("employee", next.employeeId);
    startTransition(() => router.push(`/?${params.toString()}`, { scroll: false }));
  }
  const personOptions = people.map((person) => ({ id: person.id,
    label: person.full_name + (!person.is_active ? ` (${t("filterInactive")})` : "") +
      (people.filter((p) => p.full_name === person.full_name).length > 1 ? ` · ${person.id}` : ""),
  }));
  const selectedPerson = filters.employeeId ? personOptions.find((person) => person.id === filters.employeeId)?.label ?? t("filterPersonMissing") : t("filterAll");
  const monthLabel = month[0].toLocaleUpperCase(locale) + month.slice(1);
  return <div className="summary-panel" aria-busy={pending}>
    <div className="summary-controls" role="group" aria-label={t("filtersLabel")}>
      <SummaryFilterPicker label={t("filterPerson")} value={selectedPerson} icon="people-outline" className="summary-person-field"
        disabled={pending || collaborators?.status !== "ready"} closeLabel={t("filterClose")}>
        {(close) => <div className="summary-person-options" role="group" aria-label={t("filterPerson")}>
          {[{ id: "", label: t("filterAll") }, ...personOptions].map((person) => <label key={person.id} className="summary-person-option">
            <input type="radio" name="summary-collaborator" value={person.id} checked={(filters.employeeId ?? "") === person.id}
              onClick={() => { if ((filters.employeeId ?? "") === person.id) close(); }}
              onChange={() => { close(); change({ ...filters, employeeId: person.id || null }); }} />
            <span>{person.label}</span>
          </label>)}
        </div>}
      </SummaryFilterPicker>
      <SummaryFilterPicker label={t("filterMonth")} value={monthLabel} icon="calendar-outline" className="summary-month-field"
        disabled={pending} closeLabel={t("filterClose")}>
        {(close) => <SummaryMonthOptions value={filters.month} max={currentMonth} locale={locale}
          previousLabel={t("filterPreviousYear")} nextLabel={t("filterNextYear")}
          onSelect={(month) => { close(); change({ ...filters, month }); }} />}
      </SummaryFilterPicker>
      <button className="metrics-refresh" type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
        <span className="metrics-icon metrics-refresh-icon" style={{ maskImage: "url(/icons/refresh-outline.svg)" }} aria-hidden="true" />
        {t(pending ? "metricsRefreshing" : "metricsRefresh")}
      </button>
    </div>
    {collaborators?.status !== "ready" && <p role="alert" className="summary-roster-error">{t("filtersRosterError")}</p>}
    {chart && result.status !== "invalid" && <SummaryMonthlyChart result={chart} />}
    {result.status === "invalid" ? <div className="summary-filter-error"><p role="alert">{t("filtersInvalid")}</p><Link href="/">{t("filtersReset")}</Link></div> : <SummaryMetrics result={result} />}
    {activity && result.status !== "invalid" && <SummaryCollaboratorTable result={activity} />}
  </div>;
}
