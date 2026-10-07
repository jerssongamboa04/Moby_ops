"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LoginState } from "../lib/auth/types";

export function LoginForm({ action, configured }: {
  action: (state: LoginState, form: FormData) => Promise<LoginState>;
  configured: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-heading">
        <Image src="/brand/moby-logo-on-light.svg" alt="MOBY" width={132} height={38} priority />
        <div className="dashboard-language auth-language" role="group" aria-label={t("language")}>
          <button type="button" aria-label={t("spanish")} aria-pressed={i18n.language === "es"}
            onClick={() => { void i18n.changeLanguage("es"); }}>ES</button>
          <button type="button" aria-label={t("english")} aria-pressed={i18n.language === "en"}
            onClick={() => { void i18n.changeLanguage("en"); }}>EN</button>
        </div>
        <h1 id="login-heading">{t("loginTitle")}</h1>
        <p>{t("loginDescription")}</p>
        {!configured && <p role="alert">{t("configurationError")}</p>}
        <form action={formAction} aria-busy={pending}>
          <label htmlFor="login-email">{t("email")}</label>
          <input id="login-email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
            value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} />
          <label htmlFor="login-password">{t("password")}</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} />
          {state.error && <p role="alert">{t(`${state.error}Error`)}</p>}
          <button className="auth-submit" type="submit" disabled={pending || !configured}>
            {t(pending ? "signingIn" : "signIn")}
          </button>
        </form>
        <p className="auth-help">{t("invitedAccess")}</p>
      </section>
    </main>
  );
}
