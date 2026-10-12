import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";
const instant = "2026-10-07T23:30:00Z";
function view(page: "summary" | "activity" = "summary") {
  return render(<LocaleProvider><DashboardShell page={page} fullName="  Jersson Gamboa  " summaryInstant={instant}><p>Existing real metric cards</p></DashboardShell></LocaleProvider>);
}
describe("approved summary welcome", () => {
  it("greets the verified person and shows Dublin's date, not the browser's UTC date", () => {
    view();
    expect(screen.getByRole("heading", { level: 1, name: "Hola, Jersson" })).toBeTruthy();
    const date = screen.getByText("Jueves, 8 de octubre de 2026");
    expect(date.tagName).toBe("TIME");
    expect(date.getAttribute("datetime")).toBe(instant);
    expect(screen.getByText("Existing real metric cards")).toBeTruthy();
  });
  it("translates the welcome and the same Dublin date without resetting real content", async () => {
    const user = userEvent.setup(); view();
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    expect(screen.getByRole("heading", { name: "Hello, Jersson" })).toBeTruthy();
    expect(screen.getByText("Thursday 8 October 2026")).toBeTruthy();
    expect(screen.getByText("Keeping Dublin moving.")).toBeTruthy();
    expect(screen.getByText("Existing real metric cards")).toBeTruthy();
  });
  it("handles Dublin's winter midnight boundary", () => {
    render(<LocaleProvider><DashboardShell page="summary" fullName="Ana" summaryInstant="2026-11-07T23:30:00Z" /></LocaleProvider>);
    expect(screen.getByText("Sábado, 7 de noviembre de 2026")).toBeTruthy();
  });
  it("does not replace Activity's heading with Summary's hero", () => {
    view("activity");
    expect(screen.getByRole("heading", { level: 1, name: "Cada actuación, con su evidencia." })).toBeTruthy();
    expect(screen.queryByText("Jueves, 8 de octubre de 2026")).toBeNull();
  });
});
