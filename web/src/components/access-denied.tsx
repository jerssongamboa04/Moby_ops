"use client";

import { useTranslation } from "react-i18next";
import { LogoutControl } from "./logout-control";

export function AccessDenied() {
  const { t } = useTranslation();
  return <main className="auth-page"><section className="auth-card">
    <h1>{t("deniedTitle")}</h1><p>{t("deniedError")}</p><LogoutControl />
  </section></main>;
}
