import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SummaryCollaboratorTable } from "../src/components/summary-collaborator-table";
import { SummaryPanel } from "../src/components/summary-panel";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";
vi.mock("next/navigation", async (original) => ({ ...await original<typeof import("next/navigation")>(), useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
const counts = { attended: 3, locked: 2, kickstand: 1, repositioned: 0, invalid: 2 };
const zero = { attended: 0, locked: 0, kickstand: 0, repositioned: 0, invalid: 0 };
const data = { month: "2024-03-01", rows: [
  { id: "00000000-0000-4000-8000-000000009102", full_name: "Ana Pérez", is_active: true, metrics: counts },
  { id: "00000000-0000-4000-8000-000000009103", full_name: "Luis", is_active: false, metrics: zero },
], total_metrics: counts };
describe("approved collaborator activity table", () => {
  it("shows names, five counts, a genuine zero row and the server total without mixing invalid actions", () => {
    render(<LocaleProvider><SummaryCollaboratorTable result={{ status: "ready", data }} /></LocaleProvider>);
    const table = screen.getByRole("table", { name: "Actividad por colaborador Marzo 2024" });
    const rows = within(table).getAllByRole("row");
    expect(within(rows[1]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual(["3", "2", "1", "0", "2"]);
    expect(within(rows[2]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual(["0", "0", "0", "0", "0"]);
    expect(within(rows[3]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual(["3", "2", "1", "0", "2"]);
    expect(within(rows[1]).getByRole("rowheader", { name: "Ana Pérez" })).toBeTruthy();
    expect(within(rows[2]).getByRole("rowheader", { name: "Luis Inactivo" })).toBeTruthy();
    expect(screen.getByText("AP").getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("renders one person's data as one row and its total", () => {
    render(<LocaleProvider><SummaryCollaboratorTable result={{ status: "ready", data: { ...data, rows: [data.rows[0]] } }} /></LocaleProvider>);
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });
  it("shows a real empty roster separately from a zero activity row", () => {
    render(<LocaleProvider><SummaryCollaboratorTable result={{ status: "ready", data: { ...data, rows: [], total_metrics: zero } }} /></LocaleProvider>);
    expect(screen.getByText("No hay colaboradores disponibles para este periodo.")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull(); expect(screen.queryByRole("table")).toBeNull();
  });
  it.each(["unavailable", "invalid", "denied"] as const)("shows %s without fabricated names or totals", (status) => {
    render(<LocaleProvider><SummaryCollaboratorTable result={{ status }} /></LocaleProvider>);
    expect(screen.getByRole("alert")).toBeTruthy(); expect(screen.queryByRole("table")).toBeNull(); expect(screen.queryByText("Total")).toBeNull();
  });
  it("changes the table labels and month with the shared language selector", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider><DashboardShell page="summary" fullName="Jersson"><SummaryCollaboratorTable result={{ status: "ready", data }} /></DashboardShell></LocaleProvider>);
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    expect(screen.getByRole("table", { name: "Activity by collaborator March 2024" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Kickstand positioned" })).toBeTruthy();
    expect(screen.getByRole("rowheader", { name: "Luis Inactive" })).toBeTruthy();
  });
  it("keeps a failed table below working cards and uses the single existing refresh", () => {
    render(<LocaleProvider><SummaryPanel filters={{ month: "2024-03", employeeId: null }} currentMonth="2026-10"
      collaborators={{ status: "ready", data: [] }} result={{ status: "ready", data: { month: "2024-03-01", today: "2026-10-08", generated_at: "2026-10-08T12:00:00Z", employee_id: null, month_metrics: counts, today_metrics: zero } }}
      activity={{ status: "unavailable" }} /></LocaleProvider>);
    expect(screen.getAllByRole("article")).toHaveLength(4); expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Actualizar" })).toHaveLength(1);
  });
});
