"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// Shared interaction for the two Summary filters, without changing their data source.
export function SummaryFilterPicker({ label, value, icon, className, disabled, closeLabel, children }: {
  label: string; value: string; icon: string; className: string; disabled: boolean; closeLabel: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  function close() { setOpen(false); }
  useEffect(() => {
    if (!open) return;
    (panel.current?.querySelector<HTMLElement>('[aria-pressed="true"], input:checked') ?? panel.current?.querySelector<HTMLElement>("button:not(:disabled)"))?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    const openedPanel = panel.current;
    const openedTrigger = trigger.current;
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      // Preserve a deliberate focus move outside; restore it when the popup disappears.
      if (document.activeElement === document.body || openedPanel?.contains(document.activeElement)) openedTrigger?.focus();
    };
  }, [open]);
  return <div ref={root} className={`summary-picker ${className}`}
    onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}
    onKeyDown={(event) => { if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(); } }}>
    <button ref={trigger} type="button" className="summary-filter-field" disabled={disabled}
      aria-label={`${label}: ${value}`} aria-haspopup="dialog" aria-expanded={open && !disabled} aria-controls={open && !disabled ? id : undefined}
      onClick={() => setOpen(!open)}>
      <span className="metrics-icon summary-filter-icon" style={{ maskImage: `url(/icons/${icon}.svg)` }} aria-hidden="true" />
      <span className="summary-filter-value">{value}</span>
      <span className="metrics-icon summary-filter-chevron" style={{ maskImage: "url(/icons/chevron-down-outline.svg)" }} aria-hidden="true" />
    </button>
    {open && !disabled && <div ref={panel} id={id} role="dialog" aria-label={label} className="summary-picker-panel">
      {children(close)}
      <button type="button" className="summary-picker-close" onClick={close}>{closeLabel}</button>
    </div>}
  </div>;
}

export function SummaryMonthOptions({ value, max, locale, previousLabel, nextLabel, onSelect }: {
  value: string; max: string; locale: string; previousLabel: string; nextLabel: string; onSelect: (month: string) => void;
}) {
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  return <>
    <div className="summary-picker-year">
      <button type="button" aria-label={previousLabel} disabled={year <= 1900} onClick={() => setYear(year - 1)}>‹</button>
      <span aria-live="polite">{year}</span>
      <button type="button" aria-label={nextLabel} disabled={year >= Number(max.slice(0, 4))} onClick={() => setYear(year + 1)}>›</button>
    </div>
    <div className="summary-month-options">
      {Array.from({ length: 12 }, (_, index) => {
        const month = `${year}-${String(index + 1).padStart(2, "0")}`;
        const date = new Date(`${month}-01T12:00:00Z`);
        const name = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "Europe/Dublin" }).format(date);
        const capital = name[0].toLocaleUpperCase(locale) + name.slice(1);
        return <button key={month} type="button" aria-label={`${capital} ${year}`} aria-pressed={month === value}
          disabled={month > max} onClick={() => onSelect(month)}>{capital}</button>;
      })}
    </div>
  </>;
}
