"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";
import reference from "../assets/summary-approved.png";

export function SummaryHero({ name, instant }: { name: string; instant?: string }) {
  const { t, i18n } = useTranslation();
  const cropId = useId();
  const locale = i18n.language === "en" ? "en-IE" : "es-ES";
  const date = instant ? new Intl.DateTimeFormat(locale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Dublin",
  }).format(new Date(instant)) : null;
  // Next emits a StaticImageData object; Vite's component tests emit the URL string.
  const illustrationUrl = typeof reference === "string" ? reference : reference.src;

  return <header className="summary-hero">
    <div className="summary-hero-copy">
      <h1>{t("greeting", { name })}</h1>
      <p className="summary-hero-tagline">{t("summaryTagline")}</p>
      {date && <time className="summary-hero-date" dateTime={instant}>{date[0].toLocaleUpperCase(locale) + date.slice(1)}</time>}
    </div>
    {/* Only the approved artwork is visible. The clip excludes the language badge
        and stops above the filters. No redraw, colour filter or invented skyline. */}
    <svg className="summary-hero-illustration" viewBox="686 40 742 175" width="742" height="175"
      aria-hidden="true" focusable="false">
      <defs><clipPath id={cropId}><path d="M686 40H1335V52H1428V215H686Z" /></clipPath></defs>
      <image href={illustrationUrl} x="0" y="0" width="1448" height="1086" clipPath={`url(#${cropId})`} />
    </svg>
  </header>;
}
