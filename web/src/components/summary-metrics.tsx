"use client";
import { useTranslation } from "react-i18next";
import type { SummaryResult } from "../lib/metrics/read-team-summary-metrics";
const metrics = [
  { key: "attended", icon: "bicycle-outline" }, { key: "locked", icon: "lock-closed-outline" },
  { key: "kickstand", icon: "kickstand" }, { key: "repositioned", icon: "move-outline" },
] as const;
export function SummaryMetrics({ result }: { result: SummaryResult }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-IE" : "es-ES";
  const data = result.status === "ready" ? result.data : null;
  const month = data ? new Intl.DateTimeFormat(locale, { month: "long", timeZone: "Europe/Dublin" }).format(new Date(data.month + "T12:00:00Z")) : "";
  return <section className="summary-metrics" aria-labelledby="metrics-heading">
    <div className="summary-metrics-heading">
      <div><h2 id="metrics-heading">{data ? t("metricsTitle", { month }) : t("metricsFallbackTitle")}</h2><p>{t("metricsDescription")}</p></div>
    </div>
    {data ? <>
      <div className="summary-metrics-grid">{metrics.map(({ key, icon }) => <article key={key} className="summary-metric" aria-labelledby={`metric-${key}`}>
        <span className="summary-metric-symbol" aria-hidden="true"><span className="metrics-icon" style={{ maskImage: `url(/icons/${icon}.svg)` }} /></span>
        <div className="summary-metric-content"><h3 id={`metric-${key}`} aria-label={t(`metric_${key}`)}>{key === "attended" ? <><span className="summary-metric-label-desktop">{t(`metric_${key}`)}</span><span className="summary-metric-label-mobile">{t("metricsAttendedShort")}</span></> : t(`metric_${key}`)}</h3><p className="summary-metric-total">{new Intl.NumberFormat(locale).format(data.month_metrics[key])}</p>
          <p className="summary-metric-period">{t(data.month.slice(0, 7) === data.today.slice(0, 7) ? "metricsThisMonth" : "metricsSelectedMonth")}</p>
          <p className="summary-metric-today"><span>{t("metricsToday")}</span> <strong>{new Intl.NumberFormat(locale).format(data.today_metrics[key])}</strong></p></div>
      </article>)}</div>
    </> : <p className="metrics-error" role="alert">{t(result.status === "denied" ? "deniedError" : "metricsError")}</p>}
  </section>;
}
