import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SummaryMetrics } from "../src/components/summary-metrics";
import { LocaleProvider } from "../src/i18n/locale-provider";
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const data = { month: "2026-10-01", today: "2026-10-08", generated_at: "2026-10-07T23:15:00+00:00", month_metrics: { attended: 10, locked: 8, kickstand: 6, repositioned: 4, invalid: 2 }, today_metrics: { attended: 3, locked: 2, kickstand: 1, repositioned: 0, invalid: 1 } };
describe("real summary metric cards", () => {
  it("shows monthly counts and today's counts separately, excluding invalid totals", () => {
    render(<LocaleProvider><SummaryMetrics result={{ status: "ready", data }} /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: "Actividad de octubre" })).toBeTruthy();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    [10, 8, 6, 4].forEach((count, i) => expect(within(cards[i]).getByText(String(count), { selector: ".summary-metric-total" })).toBeTruthy());
    [3, 2, 1, 0].forEach((count, i) => expect(within(cards[i]).getByText(String(count), { selector: "strong" })).toBeTruthy());
    expect(screen.getByText(/8 oct 2026, 00:15/)).toBeTruthy();
  });
  it("renders real zeros without suggesting a failure", () => {
    const zero = { attended: 0, locked: 0, kickstand: 0, repositioned: 0, invalid: 0 };
    render(<LocaleProvider><SummaryMetrics result={{ status: "ready", data: { ...data, month_metrics: zero, today_metrics: zero } }} /></LocaleProvider>);
    expect(screen.getAllByText("0")).toHaveLength(8);
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it.each(["unavailable", "denied"] as const)("shows %s without fake counts and lets the user retry", async (status) => {
    const user = userEvent.setup();
    render(<LocaleProvider><SummaryMetrics result={{ status }} /></LocaleProvider>);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("article")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refresh).toHaveBeenCalled();
  });
  it("translates labels and refreshes the current server route", async () => {
    const user = userEvent.setup();
    const { DashboardShell } = await import("../src/components/dashboard-shell");
    render(<LocaleProvider><DashboardShell page="summary" fullName="Jersson"><SummaryMetrics result={{ status: "ready", data }} /></DashboardShell></LocaleProvider>);
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    expect(screen.getByRole("heading", { name: "October activity" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Kickstand positioned" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refresh).toHaveBeenCalled();
  });
});
