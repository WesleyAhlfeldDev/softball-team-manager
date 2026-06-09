import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm, SocialButtons } from "../AuthForms";

export const metadata: Metadata = { title: "Log in" };

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "AccessDenied":
      return "That account isn't permitted to sign in.";
    case "OAuthAccountNotLinked":
      return "That email is already linked to a different sign-in method.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = errorMessage(error);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-1 text-2xl" style={{ color: "var(--color-text-primary)" }}>
          Log in
        </h1>
      </div>

      {message && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--color-danger-dim)", color: "var(--color-danger-400)" }}
        >
          {message}
        </p>
      )}

      <SocialButtons />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--color-border-subtle)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or</span>
        <span className="h-px flex-1" style={{ background: "var(--color-border-subtle)" }} />
      </div>

      <LoginForm />

      <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--color-text-brand)" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
