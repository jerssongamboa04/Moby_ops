"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { signOutAction } from "../app/login/actions";

export function LogoutControl() {
  const { t } = useTranslation();
  const [state, action, pending] = useActionState(signOutAction, {});
  return (
    <form action={action} className="logout-control">
      <button type="submit" disabled={pending}>{t(pending ? "signingOut" : "signOut")}</button>
      {state.error && <p role="alert">{t("unavailableError")}</p>}
    </form>
  );
}
