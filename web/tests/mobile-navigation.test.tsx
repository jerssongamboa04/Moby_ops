import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";
let mobile = true;
const listeners = new Set<() => void>();
beforeEach(() => {
  mobile = true; listeners.clear();
  vi.stubGlobal("matchMedia", () => ({ matches: mobile, addEventListener: (_: string, fn: () => void) => listeners.add(fn), removeEventListener: (_: string, fn: () => void) => listeners.delete(fn) }));
});
afterEach(() => vi.unstubAllGlobals());
function view(page: "summary" | "activity" = "summary") { return render(<LocaleProvider><DashboardShell page={page} fullName="Jersson Gamboa" /></LocaleProvider>); }
it("keeps navigation, language and sign out unavailable until opening the mobile menu", async () => {
  const user = userEvent.setup(); view();
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(screen.queryByRole("group", { name: "Idioma" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Cerrar sesión" })).toBeNull();
  const toggle = screen.getByRole("button", { name: "Abrir menú" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await user.click(toggle);
  const nav = screen.getByRole("navigation", { name: "Navegación principal" });
  expect(within(nav).getAllByRole("link")).toHaveLength(2);
  expect(screen.getByRole("group", { name: "Idioma" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeTruthy();
});
it("changes language inside the Activity menu and keeps its selection when closed", async () => {
  const user = userEvent.setup(); view("activity");
  await user.click(screen.getByRole("button", { name: "Abrir menú" }));
  await user.click(screen.getByRole("button", { name: "Inglés" }));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Every action, with its evidence.");
  await user.click(screen.getByRole("button", { name: "Close menu" }));
  expect(screen.queryByRole("group", { name: "Language" })).toBeNull();
  expect(document.documentElement.lang).toBe("en");
});
it("closes with Escape and restores focus to the disclosure button", async () => {
  const user = userEvent.setup(); view();
  const toggle = screen.getByRole("button", { name: "Abrir menú" });
  await user.click(toggle);
  screen.getByRole("link", { name: "Actividad" }).focus();
  await user.keyboard("{Escape}");
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(toggle);
});
it("closes on outside touch and when choosing a section", async () => {
  const user = userEvent.setup(); view();
  const toggle = screen.getByRole("button", { name: "Abrir menú" });
  await user.click(toggle); fireEvent.pointerDown(screen.getByRole("main"));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await user.click(toggle); await user.click(screen.getByRole("link", { name: "Resumen" }));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
});
it("does not hide desktop navigation or move its Summary language control", () => {
  mobile = false; view();
  expect(screen.getByRole("navigation")).toBeTruthy();
  expect(screen.getByRole("group", { name: "Idioma" }).closest("main")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Abrir menú" })).toBeNull();
});
it("groups the existing profile, language and sign out in the mobile account card", async () => {
  const user = userEvent.setup(); view();
  await user.click(screen.getByRole("button", { name: "Abrir menú" }));
  const account = screen.getByRole("group", { name: "Perfil" });
  expect(within(account).getByText("Jersson Gamboa")).toBeTruthy();
  expect(within(account).getByText("Supervisor")).toBeTruthy();
  expect(within(account).getByText("JG")).toBeTruthy();
  expect(within(account).getByRole("group", { name: "Idioma" })).toBeTruthy();
  expect(within(account).queryByText("Idioma")).toBeNull();
  expect(within(account).getByRole("button", { name: "Cerrar sesión" })).toBeTruthy();
});
