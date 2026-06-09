"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestAccessAction, type AccessRequestState } from "@/server/actions/access";

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
      {pending ? "Sending…" : "Request access"}
    </button>
  );
}

export function RequestAccessForm() {
  const [state, formAction] = useActionState<AccessRequestState, FormData>(
    requestAccessAction,
    undefined,
  );

  if (state && "ok" in state) {
    return (
      <div
        className="rounded-lg px-4 py-3 text-sm"
        style={{ background: "var(--color-brand-dim)", color: "var(--color-text-brand)" }}
      >
        Thanks! Your request is in — we&apos;ll be in touch when a spot opens up.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state && "error" in state && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--color-danger-dim)", color: "var(--color-danger-400)" }}
        >
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="ra-name" className="field-label">Name</label>
          <input id="ra-name" name="name" type="text" autoComplete="name" required className="input" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="ra-email" className="field-label">Email</label>
          <input id="ra-email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
        </div>
      </div>

      <div>
        <label htmlFor="ra-message" className="field-label">Tell us about your team (optional)</label>
        <textarea id="ra-message" name="message" rows={3} className="input" style={{ resize: "vertical" }} placeholder="League, team name, anything you'd like us to know" />
      </div>

      {/* Honeypot — hidden from humans, ignored by us if filled. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <SubmitButton />
    </form>
  );
}
