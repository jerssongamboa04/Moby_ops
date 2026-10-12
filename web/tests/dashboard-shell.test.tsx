import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";

function renderHome() {
  return render(<LocaleProvider><DashboardShell page="summary" fullName="Jersson Gamboa" /></LocaleProvider>);
}

describe("dashboard navigation and language", () => {
  it("offers only Summary and Activity with real links and the selected page", () => {
    renderHome();
    const nav = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(within(nav).getByRole("link", { name: "Resumen" }).getAttribute("href")).toBe("/");
    expect(within(nav).getByRole("link", { name: "Resumen" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Actividad" }).getAttribute("href")).toBe("/activity");
    expect(screen.getByRole("link", { name: "Ir al contenido" }).getAttribute("href")).toBe("#main-content");
  });

  it("switches visible content, navigation and document language to English and back", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hello, Jersson");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeTruthy();
    expect(screen.getByText("Jersson Gamboa")).toBeTruthy();
    expect(screen.queryByText(/DEMO/)).toBeNull();
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("button", { name: "English" }).getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Spanish" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hola, Jersson");
    expect(document.documentElement.lang).toBe("es");
  });

  it("lets keyboard users change language and exposes a main content target", async () => {
    const user = userEvent.setup();
    renderHome();
    screen.getByRole("button", { name: "Inglés" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hello, Jersson");
    expect(screen.getByRole("main").id).toBe("main-content");
  });

  it("keeps the language when the shared layout renders Activity and marks its link", async () => {
    const user = userEvent.setup();
    const view = renderHome();
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    view.rerender(<LocaleProvider><DashboardShell page="activity" fullName="Jersson Gamboa" /></LocaleProvider>);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Every action, with its evidence.");
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).getByRole("link", { name: "Activity" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Summary" }).hasAttribute("aria-current")).toBe(false);
    expect(document.documentElement.lang).toBe("en");
    expect(screen.queryByRole("group", { name: "Language" })).toBeNull();
  });

  it("does not share locale between independent application instances", async () => {
    const user = userEvent.setup();
    const view = renderHome();
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    view.unmount();
    renderHome();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hola, Jersson");
  });
});
it("does not render a language selector in Activity", () => {
  render(<LocaleProvider><DashboardShell page="activity" fullName="Jersson Gamboa" /></LocaleProvider>);
  expect(screen.queryByRole("group", { name: "Idioma" })).toBeNull();
});

it("preserves the current Activity copy and Dublin date", () => {
  render(<LocaleProvider><DashboardShell page="activity" fullName="Jersson Gamboa" activityInstant="2026-10-11T23:30:00Z" /></LocaleProvider>);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Cada actuación, con su evidencia.");
  expect(screen.getByText("Cada actuación, con su evidencia.")).toBeTruthy();
  expect(screen.getByText(/lunes, 12 de octubre de 2026/)).toBeTruthy();
});
