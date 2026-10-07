import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "../src/components/login-form";
import { LocaleProvider } from "../src/i18n/locale-provider";
import type { LoginState } from "../src/lib/auth/types";

function view(action: (s: LoginState, f: FormData) => Promise<LoginState>, configured = true) {
  render(<LocaleProvider><LoginForm action={action} configured={configured} /></LocaleProvider>);
}
async function fill() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Correo electrónico"), "supervisor@example.invalid");
  await user.type(screen.getByLabelText("Contraseña"), "test-password");
  return user;
}

describe("web sign-in form", () => {
  it("submits credentials and displays the generic server error in the selected language", async () => {
    const action = vi.fn<(s: LoginState, f: FormData) => Promise<LoginState>>(async () => ({ error: "credentials" }));
    view(action);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect((await screen.findByRole("alert")).textContent).toBe("No se pudo iniciar sesión. Revisa tus credenciales.");
    const form = action.mock.calls[0][1] as FormData;
    expect(form.get("email")).toBe("supervisor@example.invalid");
    expect(form.get("password")).toBe("test-password");
    await user.click(screen.getByRole("button", { name: "Inglés" }));
    expect(screen.getByRole("alert").textContent).toBe("Unable to sign in. Check your credentials.");
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });
  it("disables repeat submission while a response is pending, then allows retry", async () => {
    let finish!: (s: LoginState) => void;
    view(() => new Promise((resolve) => { finish = resolve; }));
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect((screen.getByRole("button", { name: "Entrando…" }) as HTMLButtonElement).disabled).toBe(true);
    finish({ error: "unavailable" });
    await waitFor(() => expect((screen.getByRole("button", { name: "Entrar" }) as HTMLButtonElement).disabled).toBe(false));
  });
  it("blocks submission when the web configuration is missing", () => {
    view(vi.fn(), false);
    expect(screen.getByRole("alert").textContent).toBe("La conexión de esta web aún no está configurada.");
    expect((screen.getByRole("button", { name: "Entrar" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
