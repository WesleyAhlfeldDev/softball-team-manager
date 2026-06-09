"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import {
  loginAction,
  signupAction,
  socialLoginAction,
  type AuthState,
} from "@/server/actions/auth";

function SubmitButton({ label }: { label: string }) {
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
      {pending ? "Please wait…" : label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <p
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: "var(--color-danger-dim)",
        color: "var(--color-danger-400)",
      }}
    >
      {message}
    </p>
  );
}

export function SocialButtons() {
  return (
    <div className="flex flex-col gap-2">
      <form action={socialLoginAction}>
        <input type="hidden" name="provider" value="google" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: "var(--color-surface-input)",
            border: "1px solid var(--color-border-default)",
            color: "var(--color-text-primary)",
          }}
        >
          <FontAwesomeIcon icon={faGoogle} style={{ width: 15, height: 15 }} />
          Continue with Google
        </button>
      </form>
      <form action={socialLoginAction}>
        <input type="hidden" name="provider" value="facebook" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: "var(--color-surface-input)",
            border: "1px solid var(--color-border-default)",
            color: "var(--color-text-primary)",
          }}
        >
          <FontAwesomeIcon icon={faFacebookF} style={{ width: 15, height: 15, color: "#1877f2" }} />
          Continue with Facebook
        </button>
      </form>
    </div>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  );
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <ErrorBanner message={state?.error} />
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" placeholder="••••••••" />
      </div>
      <SubmitButton label="Log in" />
    </form>
  );
}

export function SignupForm({ enabled }: { enabled: boolean }) {
  const [state, formAction] = useActionState<AuthState, FormData>(
    signupAction,
    undefined,
  );

  if (!enabled) {
    return (
      <p
        className="rounded-lg px-4 py-3 text-sm"
        style={{ background: "var(--color-surface-input)", color: "var(--color-text-secondary)" }}
      >
        Signups are currently closed. Check back soon — or log in if you already
        have an account.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <ErrorBanner message={state?.error} />
      <div>
        <label htmlFor="name" className="field-label">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required className="input" placeholder="Coach Smith" />
      </div>
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="At least 8 characters" />
      </div>
      <SubmitButton label="Create account" />
    </form>
  );
}
