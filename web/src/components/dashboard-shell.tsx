"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LogoutControl } from "./logout-control";
import { SummaryHero } from "./summary-hero";
import { ActivityTrail } from "./activity-trail";

type Page = "summary" | "activity";

const mobileQuery = "(max-width: 760px)";
function subscribeToViewport(update: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}
function mobileViewport() {
  return typeof window.matchMedia === "function" && window.matchMedia(mobileQuery).matches;
}
function serverViewport() { return false; }

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

export function DashboardShell({ page, fullName, children, summaryInstant, activityInstant }: { page: Page; fullName: string; children?: ReactNode; summaryInstant?: string; activityInstant?: string }) {
  const { t, i18n } = useTranslation();
  const isMobile = useSyncExternalStore(subscribeToViewport, mobileViewport, serverViewport);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const sidebar = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobile || !menuOpen) return;
    function closeOutside(event: PointerEvent) {
      if (!sidebar.current?.contains(event.target as Node)) {
        if (menu.current?.contains(document.activeElement)) trigger.current?.focus();
        setMenuOpen(false);
      }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setMenuOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, [isMobile, menuOpen]);
  const languageControl = <div className="dashboard-language" role="group" aria-label={t("language")}>
    {([{ code: "es", label: "spanish", text: "ES" }, { code: "en", label: "english", text: "EN" }] as const).map((locale) => (
      <button key={locale.code} type="button" aria-label={t(locale.label)} aria-pressed={i18n.language === locale.code}
        onClick={() => { void i18n.changeLanguage(locale.code); }}>{locale.text}</button>
    ))}
  </div>;
  const firstName = fullName.trim().split(/\s+/)[0];
  const initials = fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">{t("skip")}</a>
      <aside ref={sidebar} className="dashboard-sidebar"
        onBlur={(event) => { if (isMobile && menuOpen && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setMenuOpen(false); }}>
        <div className="dashboard-brand-row">
        <div className="dashboard-brand">
          <Image src="/brand/moby-logo-on-dark.svg" alt="MOBY" width={132} height={38} priority />
        </div>
        <button ref={trigger} type="button" className="dashboard-menu-toggle" aria-hidden={!isMobile} inert={!isMobile}
          aria-label={t(menuOpen ? "menuClose" : "menuOpen")} aria-expanded={menuOpen} aria-controls={menuId}
          onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
        </div>
        <div ref={menu} id={menuId} className="dashboard-sidebar-content" data-open={menuOpen}
          aria-hidden={isMobile && !menuOpen} inert={isMobile && !menuOpen}>
        <div className="dashboard-sidebar-inner">
        <nav className="dashboard-navigation" aria-label={t("navigation")}>
          {([{ id: "summary", href: "/" }, { id: "activity", href: "/activity" }] as const).map((item) => (
            <Link key={item.id} href={item.href} aria-current={page === item.id ? "page" : undefined}
              className="dashboard-nav-link" onClick={() => { if (isMobile) { setMenuOpen(false); trigger.current?.focus(); } }}>
              <NavigationIcon page={item.id} />
              <span>{t(item.id)}</span>
            </Link>
          ))}
        </nav>
        <div className="dashboard-account" role="group" aria-label={t("profile")}>
        <div className="dashboard-profile">
          <span className="dashboard-avatar" aria-hidden="true">{initials}</span>
          <div><p>{fullName}</p><p className="dashboard-profile-role">{t("supervisor")}</p></div>
        </div>
        <div className="dashboard-account-actions">
        {isMobile && languageControl}
        <LogoutControl />
        </div>
        </div>
        </div>
        </div>
      </aside>
      <main id="main-content" className={`dashboard-main${page === "summary" ? " dashboard-main--summary" : ""}`} tabIndex={-1}>
        {page === "summary" && !isMobile && <div className="dashboard-topbar">{languageControl}</div>}
        {page === "summary" ? <SummaryHero name={firstName} instant={summaryInstant} /> : <header className="dashboard-heading dashboard-heading--activity">
          <div className="activity-heading-copy">
          <h1>{t("activityTagline")}</h1>
          {activityInstant && <p className="activity-heading-date">{new Intl.DateTimeFormat(i18n.language === "en" ? "en-IE" : "es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Dublin" }).format(new Date(activityInstant))}</p>}
          </div>
          <ActivityTrail />
        </header>}
        {children ?? <section className="dashboard-placeholder" aria-labelledby="pending-heading">
          <span className="dashboard-placeholder-icon"><NavigationIcon page={page} /></span>
          <h2 id="pending-heading">{t(page === "summary" ? "summaryPending" : "activityPending")}</h2>
          <p>{t("pendingDescription")}</p>
        </section>}
      </main>
    </div>
  );
}
