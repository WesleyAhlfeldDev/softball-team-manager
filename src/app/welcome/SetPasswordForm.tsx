"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setInitialPasswordAction, type AuthState } from "@/server/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{
        background: "var(--color-brand-500)",
        color: "#07070f",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.05em",
      }}
    >
      {pending ? "Saving…" : "Set password"}
    </button>
  );
}

export function SetPasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    setInitialPasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--color-danger-dim)", color: "var(--color-danger-400)" }}
        >
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="password" className="field-label">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="At least 8 characters" />
      </div>
      <div>
        <label htmlFor="confirm" className="field-label">Confirm password</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="Re-enter password" />
      </div>
      <SubmitButton />
    </form>
  );
}
