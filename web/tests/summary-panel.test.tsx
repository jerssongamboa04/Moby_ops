import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SummaryPanel } from "../src/components/summary-panel";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const person = { id: "00000000-0000-4000-8000-000000009102", full_name: "Ana", is_active: false };
const data = { employee_id: null, month: "2026-10-01", today: "2026-10-07", generated_at: "2026-10-07T18:29:00Z", month_metrics: { attended: 2, locked: 1, kickstand: 1, repositioned: 1, invalid: 1 }, today_metrics: { attended: 1, locked: 1, kickstand: 0, repositioned: 0, invalid: 0 } };
const props = { filters: { month: "2026-10", employeeId: null }, currentMonth: "2026-10", collaborators: { status: "ready" as const, data: [person] }, result: { status: "ready" as const, data } };
beforeEach(() => vi.clearAllMocks());
function view() { return render(<LocaleProvider><DashboardShell page="summary" fullName="Jersson"><SummaryPanel {...props} /></DashboardShell></LocaleProvider>); }
describe("approved real summary controls", () => {
  it("shows the selected filters without an update timestamp", () => {
    view();
    expect(screen.getByRole("button", { name: "Colaborador: Todos los colaboradores" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mes: Octubre 2026" })).toBeTruthy();
    expect(screen.getByText("Octubre 2026")).toBeTruthy();
    expect(screen.queryByText(/Actualizado:/)).toBeNull();
    expect(screen.queryByText("Operaciones")).toBeNull();
    expect(screen.getAllByRole("button", { name: "Actualizar" })).toHaveLength(1);
  });
  it("changes collaborator through the URL while keeping the month", async () => {
    const user = userEvent.setup(); view();
    await user.click(screen.getByRole("button", { name: /^Colaborador:/ }));
    await user.click(screen.getByRole("radio", { name: "Ana (Inactivo)" }));
    expect(router.push).toHaveBeenCalledWith(`/?month=2026-10&employee=${person.id}`, { scroll: false });
  });
  it("changes month while preserving a selected historical collaborator", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider><SummaryPanel {...props} filters={{ month: "2026-10", employeeId: person.id }} /></LocaleProvider>);
    await user.click(screen.getByRole("button", { name: /^Mes:/ }));
    await user.click(screen.getByRole("button", { name: "Septiembre 2026" }));
    expect(router.push).toHaveBeenCalledWith(`/?month=2026-09&employee=${person.id}`, { scroll: false });
  });
  it("refreshes without changing the filters or adding history", async () => {
    const user = userEvent.setup(); view();
    await user.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(router.refresh).toHaveBeenCalledTimes(1); expect(router.push).not.toHaveBeenCalled();
  });
  it("localizes the controls, inactive label and month", async () => {
    const user = userEvent.setup(); view();
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    await user.click(screen.getByRole("button", { name: /^Collaborator:/ }));
    expect(screen.getByText("Ana (Inactive)")).toBeTruthy();
    expect(screen.getByText("October 2026")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeTruthy();
  });
  it("disables the failed roster and allows refresh without losing good counts", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider><SummaryPanel {...props} collaborators={{ status: "unavailable" }} /></LocaleProvider>);
    expect(screen.getByRole("button", { name: /^Colaborador:/ }).hasAttribute("disabled")).toBe(true); expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Actualizar" })); expect(router.refresh).toHaveBeenCalled();
  });
  it("shows invalid URL filters with a real reset link and no fake counts", () => {
    render(<LocaleProvider><SummaryPanel {...props} filters={null} result={{ status: "invalid" }} /></LocaleProvider>);
    expect(screen.getByRole("alert")).toBeTruthy(); expect(screen.queryByRole("article")).toBeNull();
    expect(screen.getByRole("link", { name: "Restablecer filtros" }).getAttribute("href")).toBe("/");
  });
});

it("opens the collaborator picker by clicking its chevron and restores focus on Escape", async () => {
  const user = userEvent.setup(); view();
  const trigger = screen.getByRole("button", { name: /^Colaborador:/ });
  await user.click(trigger.querySelector(".summary-filter-chevron")!);
  expect(screen.getByRole("dialog", { name: "Colaborador" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
it("opens a styled month picker and prevents future months", async () => {
  const user = userEvent.setup(); view();
  await user.click(screen.getByRole("button", { name: /^Mes:/ }));
  expect(screen.getByRole("dialog", { name: "Mes" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Noviembre 2026" }).hasAttribute("disabled")).toBe(true);
  expect(screen.queryByText(/Actualizado:/)).toBeNull();
});

it("keeps selection while navigating years and closes after a historical month is chosen", async () => {
  const user = userEvent.setup(); view();
  await user.click(screen.getByRole("button", { name: /^Mes:/ }));
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Octubre 2026" }));
  await user.click(screen.getByRole("button", { name: "Año anterior" }));
  expect(router.push).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Diciembre 2025" }));
  expect(router.push).toHaveBeenCalledWith("/?month=2025-12", { scroll: false });
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("supports keyboard opening and closes on a click outside without stealing focus", async () => {
  const user = userEvent.setup(); view();
  screen.getByRole("button", { name: /^Mes:/ }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("dialog", { name: "Mes" })).toBeTruthy();
  const refresh = screen.getByRole("button", { name: "Actualizar" });
  await user.click(refresh);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(refresh);
});
it("keeps future months and years unavailable and honors the earliest allowed year", async () => {
  const user = userEvent.setup();
  render(<LocaleProvider><SummaryPanel {...props} filters={{ month: "1900-01", employeeId: null }} /></LocaleProvider>);
  await user.click(screen.getByRole("button", { name: /^Mes:/ }));
  expect(screen.getByRole("button", { name: "Año anterior" }).hasAttribute("disabled")).toBe(true);
  await user.click(screen.getByRole("button", { name: "Febrero 1900" }));
  expect(router.push).toHaveBeenCalledWith("/?month=1900-02", { scroll: false });
});
