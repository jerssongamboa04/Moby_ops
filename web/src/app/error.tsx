"use client";

import { useTranslation } from "react-i18next";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useTranslation();
  return <main className="auth-page"><section className="auth-card">
    <h1>{t("unavailableTitle")}</h1><p role="alert">{t("unavailableError")}</p>
    <button className="auth-submit" type="button" onClick={reset}>{t("retry")}</button>
  </section></main>;
}
