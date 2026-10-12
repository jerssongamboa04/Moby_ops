"use client";

import { createInstance } from "i18next";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next";
import { resources } from "./resources";

function DocumentLanguage() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.use(initReactI18next).init({
      resources, lng: "es", fallbackLng: "es", supportedLngs: ["es", "en"],
      initAsync: false,
      interpolation: { escapeValue: false },
    });
    return i18n;
  });
  return (
    <I18nextProvider i18n={instance}>
      <DocumentLanguage />
      {children}
    </I18nextProvider>
  );
}
