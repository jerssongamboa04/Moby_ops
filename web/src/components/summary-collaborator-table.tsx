"use client";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CollaboratorSummaryResult } from "../lib/metrics/read-team-summary-by-collaborator";
const columns = ["attended", "locked", "kickstand", "repositioned", "invalid"] as const;
export function SummaryCollaboratorTable({ result }: { result: CollaboratorSummaryResult }) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const locale = i18n.language === "en" ? "en-IE" : "es-ES";
  const format = new Intl.NumberFormat(locale);
  function metricCell(key: typeof columns[number], value: number, rowId?: string) {
    const label = t(key === "attended" ? "collaboratorAttended" : key === "invalid" ? "chartInvalid" : `collaboratorCompact_${key}`);
    const icon = key === "locked" ? "lock-closed-outline" : key === "kickstand" ? "kickstand" : "move-outline";
    return <td key={key} id={rowId ? `${rowId}-${key}` : undefined} role="cell" className={`summary-person-metric summary-person-metric--${key}`}>
      {key !== "attended" && (key === "invalid" ? <svg className="summary-person-task-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 8 8 8m0-8-8 8" /></svg> :
        <span className="summary-person-task-icon" aria-hidden="true" style={{ maskImage: `url(/icons/${icon}.svg)` }} />)}
      <span className="summary-person-metric-label" aria-hidden="true">{label}</span>
      <span className={key === "invalid" ? "summary-person-metric-value summary-invalid-badge" : "summary-person-metric-value"}>{format.format(value)}</span>
    </td>;
  }
  const month = result.status === "ready" ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "Europe/Dublin" })
    .formatToParts(new Date(result.data.month + "T12:00:00Z")).filter((part) => part.type === "month" || part.type === "year").map((part) => part.value).join(" ") : null;
  const monthLabel = month ? month[0].toLocaleUpperCase(locale) + month.slice(1) : null;
  return <section className="summary-collaborator-card" aria-labelledby={id}>
    <header className="summary-collaborator-heading">
      <h2 id={id}>{t("collaboratorActivityTitle")}</h2>
      {monthLabel && <span id={`${id}-month`} className="summary-collaborator-month">{monthLabel}</span>}
    </header>
    {result.status !== "ready" ? <p className="summary-collaborator-error" role="alert">{t(result.status === "invalid" ? "filtersInvalid" : result.status === "denied" ? "deniedError" : "collaboratorActivityError")}</p> :
      result.data.rows.length === 0 ? <p className="summary-collaborator-empty">{t("collaboratorActivityEmpty")}</p> :
        <div className="summary-collaborator-scroll" role="region" aria-label={t("collaboratorActivityTitle")} tabIndex={0}>
          <table role="table" className="summary-collaborator-table" aria-labelledby={`${id} ${id}-month`}>
            <thead role="rowgroup"><tr role="row"><th scope="col">{t("filterPerson")}</th>{columns.map((key) => <th scope="col" key={key}>{t(key === "attended" ? "collaboratorAttended" : key === "invalid" ? "chartInvalid" : `metric_${key}`)}</th>)}</tr></thead>
            <tbody role="rowgroup">{result.data.rows.map((person) => {
              const initials = person.full_name.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toLocaleUpperCase(locale);
              const rowId = `${id}-${person.id}`;
              const stateKey = `${result.data.month}:${person.id}`;
              const isExpanded = expanded[stateKey] ?? false;
              return <tr key={person.id} role="row" data-expanded={isExpanded}>
                <th scope="row" role="rowheader" aria-label={person.full_name + (!person.is_active ? ` ${t("filterInactive")}` : "")}><div className="summary-collaborator-person">
                  <span className="summary-collaborator-avatar" aria-hidden="true">{initials}</span>
                  <span className="summary-collaborator-name">{person.full_name}{!person.is_active && <span className="summary-collaborator-inactive"> {t("filterInactive")}</span>}</span>
                </div>
                  <button type="button" className="summary-person-toggle" aria-label={t("collaboratorToggle", { name: person.full_name })}
                    aria-expanded={isExpanded} aria-controls={columns.filter((key) => key !== "attended").map((key) => `${rowId}-${key}`).join(" ")}
                    onClick={() => setExpanded((current) => ({ ...current, [stateKey]: !isExpanded }))}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </th>
                {columns.map((key) => metricCell(key, person.metrics[key], rowId))}
              </tr>;
            })}</tbody>
            <tfoot role="rowgroup"><tr role="row"><th scope="row" role="rowheader"><span className="summary-person-total-desktop">{t("collaboratorTotal")}</span><span className="summary-person-total-mobile">{t("collaboratorCompactTotal")}</span></th>{columns.map((key) => metricCell(key, result.data.total_metrics[key]))}</tr></tfoot>
          </table>
        </div>}
  </section>;
}
