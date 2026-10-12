"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { signOutAction } from "../app/login/actions";

export function LogoutControl() {
  const { t } = useTranslation();
  const [state, action, pending] = useActionState(signOutAction, {});
  return (
    <form action={action} className="logout-control">
      <button type="submit" disabled={pending}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M9 12h12M17 8l4 4-4 4" />
        </svg>
        <span>{t(pending ? "signingOut" : "signOut")}</span>
      </button>
      {state.error && <p role="alert">{t("unavailableError")}</p>}
    </form>
  );
}
