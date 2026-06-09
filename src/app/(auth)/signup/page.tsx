import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm, SocialButtons } from "../AuthForms";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  const signupsOpen = process.env.ALLOW_SIGNUPS === "true";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow">Get started</p>
        <h1 className="mt-1 text-2xl" style={{ color: "var(--color-text-primary)" }}>
          Create your account
        </h1>
      </div>

      {signupsOpen && (
        <>
          <SocialButtons />
          <div className="flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "var(--color-border-subtle)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or</span>
            <span className="h-px flex-1" style={{ background: "var(--color-border-subtle)" }} />
          </div>
        </>
      )}

      <SignupForm enabled={signupsOpen} />

      <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-text-brand)" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
