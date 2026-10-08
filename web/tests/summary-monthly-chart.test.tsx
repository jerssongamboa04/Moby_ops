import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SummaryMonthlyChart } from "../src/components/summary-monthly-chart";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";
const data = { month: "2026-10-01", today: "2026-10-08", entries: [
  { month: "2026-07-01", valid: 4, invalid: 1, inProgress: false },
  { month: "2026-08-01", valid: 0, invalid: 0, inProgress: false },
  { month: "2026-09-01", valid: 8, invalid: 2, inProgress: false },
  { month: "2026-10-01", valid: 2, invalid: 3, inProgress: true },
] };
describe("approved monthly chart", () => {
  it("shows actual ordered months, valid and invalid counts separately and the current partial month", () => {
    render(<LocaleProvider><SummaryMonthlyChart result={{ status: "ready", data }} /></LocaleProvider>);
    const rows = within(screen.getByRole("table", { name: "Datos de actuaciones por mes" })).getAllByRole("row");
    expect(rows.slice(1).map((row) => row.textContent)).toEqual(["Julio 202641", "Agosto 202600", "Septiembre 202682", "Octubre 2026 (En curso)23"]);
    const totals = screen.getByRole("complementary", { name: "Totales del mes seleccionado" });
    expect(within(totals).getByText("2")).toBeTruthy(); expect(within(totals).getByText("3")).toBeTruthy();
    expect(screen.getByText("Octubre muestra el acumulado hasta hoy.")).toBeTruthy();
  });
  it("shows zero activity as data, not an error or invented bar", () => {
    render(<LocaleProvider><SummaryMonthlyChart result={{ status: "ready", data: { ...data, entries: data.entries.map((entry) => ({ ...entry, valid: 0, invalid: 0 })) } }} /></LocaleProvider>);
    expect(screen.getByText("No hay actuaciones válidas en este periodo.")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("does not label a historical period as in progress", () => {
    render(<LocaleProvider><SummaryMonthlyChart result={{ status: "ready", data: { ...data, entries: data.entries.map((entry) => ({ ...entry, inProgress: false })) } }} /></LocaleProvider>);
    expect(screen.queryByText("En curso")).toBeNull(); expect(screen.getByText("Octubre muestra un mes cerrado.")).toBeTruthy();
  });
  it.each(["unavailable", "denied", "invalid"] as const)("does not display fabricated totals for %s", (status) => {
    render(<LocaleProvider><SummaryMonthlyChart result={{ status }} /></LocaleProvider>);
    expect(screen.getByRole("alert")).toBeTruthy(); expect(screen.queryByRole("table")).toBeNull();
  });
  it("translates months, headings, partial notice and totals with the shared selector", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider><DashboardShell page="summary" fullName="Jersson"><SummaryMonthlyChart result={{ status: "ready", data }} /></DashboardShell></LocaleProvider>);
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    expect(screen.getByRole("heading", { name: "Monthly activity" })).toBeTruthy();
    expect(screen.getByText("October shows the total up to today.")).toBeTruthy();
    expect(screen.getByRole("table", { name: "Monthly activity data" })).toBeTruthy();
  });
});
