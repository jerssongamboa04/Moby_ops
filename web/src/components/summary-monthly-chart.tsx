"use client";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { MonthlySeriesResult } from "../lib/metrics/read-summary-monthly-series";

export function SummaryMonthlyChart({ result }: { result: MonthlySeriesResult }) {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const gradientId = useId();
  const locale = i18n.language === "en" ? "en-IE" : "es-ES";
  const number = new Intl.NumberFormat(locale);
  function monthName(month: string) {
    const name = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "Europe/Dublin" }).format(new Date(month + "T12:00:00Z"));
    return name[0].toLocaleUpperCase(locale) + name.slice(1);
  }
  if (result.status !== "ready") return <section className="summary-monthly-chart" aria-labelledby={headingId}>
    <h2 id={headingId}>{t("chartTitle")}</h2><p role="alert" className="chart-error">{t(result.status === "invalid" ? "filtersInvalid" : "chartError")}</p>
  </section>;
  const { entries } = result.data;
  const selected = entries[entries.length - 1];
  const maximum = Math.max(5, ...entries.map((entry) => entry.valid));
  const magnitude = 10 ** Math.floor(Math.log10(maximum / 5));
  const ratio = maximum / 5 / magnitude;
  const step = (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10) * magnitude;
  const upper = step * 5;
  const width = 820 / entries.length;
  const barWidth = Math.min(118, width * .58);
  const yearStart = entries[0].month.slice(0, 4), yearEnd = selected.month.slice(0, 4);
  const range = `${monthName(entries[0].month)}${yearStart !== yearEnd ? ` ${yearStart}` : ""}–${monthName(selected.month)} ${yearEnd}`;
  return <section className="summary-monthly-chart" aria-labelledby={headingId}>
    <div className="summary-chart-plot">
      <h2 id={headingId}>{t("chartTitle")}</h2>
      <p className="summary-chart-description">{t("chartDescription", { range })}</p>
      <svg viewBox="0 0 900 248" className="summary-chart-svg" aria-hidden="true" focusable="false">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#244f32" /><stop offset="1" stopColor="#173f25" /></linearGradient></defs>
        {Array.from({ length: 6 }, (_, index) => {
          const y = 192 - index * 31;
          return <g key={index}><line x1="58" x2="882" y1={y} y2={y} stroke="#d5dad5" strokeDasharray={index ? "3 4" : undefined} />
            <text x="44" y={y + 4} textAnchor="end" className="chart-axis-text">{number.format(step * index)}</text></g>;
        })}
        <line x1="58" x2="58" y1="37" y2="192" stroke="#c3c9c3" />
        {entries.map((entry, index) => {
          const x = 60 + width * (index + .5);
          const height = entry.valid / upper * 155;
          const y = 192 - height;
          return <g key={entry.month}>
            <rect x={x - barWidth / 2} y={y} width={barWidth} height={height} rx="7" fill={entry.inProgress ? "#D1FF00" : `url(#${gradientId})`}
              stroke={entry.inProgress && entry.valid ? "#54722c" : undefined} strokeDasharray={entry.inProgress ? "5 4" : undefined} />
            <text x={x} y={y - 10} textAnchor="middle" className="chart-count-text">{number.format(entry.valid)}</text>
            {entry.inProgress && <g><rect x={x - 42} y={Math.max(4, y - 52)} width="84" height="22" rx="7" fill="#efffc2" />
              <text x={x} y={Math.max(4, y - 52) + 15} textAnchor="middle" className="chart-progress-text">{t("chartInProgress")}</text></g>}
            <text x={x} y="219" textAnchor="middle" className="chart-axis-text">{monthName(entry.month)}</text>
          </g>;
        })}
      </svg>
      <table className="chart-data-table"><caption>{t("chartDataLabel")}</caption><thead><tr><th>{t("filterMonth")}</th><th>{t("chartValid")}</th><th>{t("chartInvalid")}</th></tr></thead>
        <tbody>{entries.map((entry) => <tr key={entry.month}><th>{monthName(entry.month)} {entry.month.slice(0, 4)}{entry.inProgress ? ` (${t("chartInProgress")})` : ""}</th><td>{number.format(entry.valid)}</td><td>{number.format(entry.invalid)}</td></tr>)}</tbody>
      </table>
      <p className="summary-chart-note"><span aria-hidden="true">ⓘ</span> {t(selected.inProgress ? "chartPartialNote" : "chartClosedNote", { month: monthName(selected.month) })}</p>
      {entries.every((entry) => entry.valid === 0) && <p className="summary-chart-empty">{t("chartEmpty")}</p>}
    </div>
    <aside className="summary-chart-totals" aria-label={t("chartSelectedTotals")}>
      <h3>{t(selected.inProgress ? "chartCurrentMonth" : "chartSelectedMonth", { month: monthName(selected.month) })}</h3>
      <p className="summary-chart-valid">{number.format(selected.valid)}</p><p className="summary-chart-total-label">{t("chartValid")}</p>
      <div className="summary-chart-invalid-group"><p className="summary-chart-invalid">{number.format(selected.invalid)}</p><p className="summary-chart-total-label">{t("chartInvalidOutside")}</p></div>
    </aside>
  </section>;
}
