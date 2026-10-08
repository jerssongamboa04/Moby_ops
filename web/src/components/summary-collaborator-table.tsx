"use client";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { CollaboratorSummaryResult } from "../lib/metrics/read-team-summary-by-collaborator";
const columns = ["attended", "locked", "kickstand", "repositioned", "invalid"] as const;
export function SummaryCollaboratorTable({ result }: { result: CollaboratorSummaryResult }) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const locale = i18n.language === "en" ? "en-IE" : "es-ES";
  const format = new Intl.NumberFormat(locale);
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
          <table className="summary-collaborator-table" aria-labelledby={`${id} ${id}-month`}>
            <thead><tr><th scope="col">{t("filterPerson")}</th>{columns.map((key) => <th scope="col" key={key}>{t(key === "attended" ? "collaboratorAttended" : key === "invalid" ? "chartInvalid" : `metric_${key}`)}</th>)}</tr></thead>
            <tbody>{result.data.rows.map((person) => {
              const initials = person.full_name.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toLocaleUpperCase(locale);
              return <tr key={person.id}>
                <th scope="row" aria-label={person.full_name + (!person.is_active ? ` ${t("filterInactive")}` : "")}><div className="summary-collaborator-person">
                  <span className="summary-collaborator-avatar" aria-hidden="true">{initials}</span>
                  <span className="summary-collaborator-name">{person.full_name}{!person.is_active && <span className="summary-collaborator-inactive"> {t("filterInactive")}</span>}</span>
                </div></th>
                {columns.map((key) => <td key={key}>{key === "invalid" ? <span className="summary-invalid-badge">{format.format(person.metrics[key])}</span> : format.format(person.metrics[key])}</td>)}
              </tr>;
            })}</tbody>
            <tfoot><tr><th scope="row">{t("collaboratorTotal")}</th>{columns.map((key) => <td key={key}>{key === "invalid" ? <span className="summary-invalid-badge">{format.format(result.data.total_metrics[key])}</span> : format.format(result.data.total_metrics[key])}</td>)}</tr></tfoot>
          </table>
        </div>}
  </section>;
}
