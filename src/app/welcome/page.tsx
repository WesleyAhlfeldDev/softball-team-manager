import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata: Metadata = { title: "Set your password" };

// Note: this page intentionally does NOT call requirePasswordChanged (that
// would redirect here in a loop). Middleware still requires a valid session.
export default async function WelcomePage() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="card card-brand w-full max-w-sm" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="eyebrow">Welcome aboard</p>
        <h1 className="mt-1 mb-1 text-2xl" style={{ color: "var(--color-text-primary)" }}>
          Set your password
        </h1>
        <p className="mb-5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          You&apos;re signed in as{" "}
          <span style={{ color: "var(--color-text-primary)" }}>{session.user.email}</span>.
          Choose a password to finish setting up your account.
        </p>
        <SetPasswordForm />
      </div>
    </div>
  );
}
