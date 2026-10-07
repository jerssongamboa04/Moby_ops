"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LogoutControl } from "./logout-control";

type Page = "summary" | "activity";

function NavigationIcon({ page }: { page: Page }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {page === "summary" ? <><path d="M5 20V11M12 20V4M19 20V8" strokeWidth="3" /></> :
        <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6M8 13h8M8 17h5" /></>}
    </svg>
  );
}

export function DashboardShell({ page, fullName }: { page: Page; fullName: string }) {
  const { t, i18n } = useTranslation();
  const firstName = fullName.trim().split(/\s+/)[0];
  const initials = fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">{t("skip")}</a>
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <Image src="/brand/moby-logo-on-dark.svg" alt="MOBY" width={132} height={38} priority />
        </div>
        <nav className="dashboard-navigation" aria-label={t("navigation")}>
          {([{ id: "summary", href: "/" }, { id: "activity", href: "/activity" }] as const).map((item) => (
            <Link key={item.id} href={item.href} aria-current={page === item.id ? "page" : undefined}
              className="dashboard-nav-link">
              <NavigationIcon page={item.id} />
              <span>{t(item.id)}</span>
            </Link>
          ))}
        </nav>
        <div className="dashboard-profile" aria-label={t("profile")}>
          <span className="dashboard-avatar" aria-hidden="true">{initials}</span>
          <div><p>{fullName}</p><p className="dashboard-profile-role">{t("supervisor")}</p></div>
        </div>
        <LogoutControl />
      </aside>
      <main id="main-content" className="dashboard-main" tabIndex={-1}>
        <div className="dashboard-topbar">
          <p className="dashboard-breadcrumb">{t("operations")} / <strong>{t(page)}</strong></p>
          <div className="dashboard-language" role="group" aria-label={t("language")}>
            {([{ code: "es", label: "spanish", text: "ES" }, { code: "en", label: "english", text: "EN" }] as const).map((locale) => (
              <button key={locale.code} type="button" aria-label={t(locale.label)}
                aria-pressed={i18n.language === locale.code}
                onClick={() => { void i18n.changeLanguage(locale.code); }}>{locale.text}</button>
            ))}
          </div>
        </div>
        <header className="dashboard-heading">
          <h1>{t(page === "summary" ? "greeting" : "activity", { name: firstName })}</h1>
          <p className="dashboard-tagline">{t(page === "summary" ? "summaryTagline" : "activityTagline")}</p>
        </header>
        <section className="dashboard-placeholder" aria-labelledby="pending-heading">
          <span className="dashboard-placeholder-icon"><NavigationIcon page={page} /></span>
          <h2 id="pending-heading">{t(page === "summary" ? "summaryPending" : "activityPending")}</h2>
          <p>{t("pendingDescription")}</p>
        </section>
      </main>
    </div>
  );
}
