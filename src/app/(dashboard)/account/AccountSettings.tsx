"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import {
  updateProfileAction,
  changePasswordAction,
  connectProviderAction,
  disconnectProviderAction,
  type AccountState,
} from "@/server/actions/account";

function StatusBanner({ state }: { state: AccountState }) {
  if (!state) return null;
  const isError = "error" in state;
  return (
    <p
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: isError ? "var(--color-danger-dim)" : "var(--color-brand-dim)",
        color: isError ? "var(--color-danger-400)" : "var(--color-text-brand)",
      }}
    >
      {isError ? state.error : state.ok}
    </p>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ background: "var(--color-brand-500)", color: "#07070f", fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState<AccountState, FormData>(updateProfileAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <StatusBanner state={state} />
      <div>
        <label htmlFor="acc-name" className="field-label">Name</label>
        <input id="acc-name" name="name" type="text" defaultValue={name} required className="input" />
      </div>
      <div>
        <label htmlFor="acc-email" className="field-label">Email</label>
        <input id="acc-email" name="email" type="email" defaultValue={email} required className="input" />
      </div>
      <SaveButton label="Save profile" />
    </form>
  );
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action] = useActionState<AccountState, FormData>(changePasswordAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <StatusBanner state={state} />
      {hasPassword && (
        <div>
          <label htmlFor="acc-current" className="field-label">Current password</label>
          <input id="acc-current" name="current" type="password" autoComplete="current-password" className="input" />
        </div>
      )}
      <div>
        <label htmlFor="acc-new" className="field-label">New password</label>
        <input id="acc-new" name="password" type="password" autoComplete="new-password" required minLength={8} className="input" placeholder="At least 8 characters" />
      </div>
      <div>
        <label htmlFor="acc-confirm" className="field-label">Confirm new password</label>
        <input id="acc-confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} className="input" />
      </div>
      <SaveButton label={hasPassword ? "Change password" : "Set password"} />
    </form>
  );
}

function ProviderRow({
  provider,
  label,
  icon,
  iconColor,
  connected,
}: {
  provider: "google" | "facebook";
  label: string;
  icon: typeof faGoogle;
  iconColor: string;
  connected: boolean;
}) {
  const [state, disconnect] = useActionState<AccountState, FormData>(disconnectProviderAction, undefined);

  return (
    <div className="flex flex-col gap-2 rounded-lg p-3" style={{ background: "var(--color-surface-input)" }}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          <FontAwesomeIcon icon={icon} style={{ width: 15, height: 15, color: iconColor }} />
          {label}
        </span>
        {connected ? (
          <form action={disconnect}>
            <input type="hidden" name="provider" value={provider} />
            <button type="submit" className="rounded-md px-3 py-1.5 text-xs font-semibold" style={{ background: "transparent", border: "1px solid var(--color-border-default)", color: "var(--color-text-muted)" }}>
              Disconnect
            </button>
          </form>
        ) : (
          <form action={connectProviderAction}>
            <input type="hidden" name="provider" value={provider} />
            <button type="submit" className="rounded-md px-3 py-1.5 text-xs font-bold" style={{ background: "var(--color-brand-500)", color: "#07070f" }}>
              Connect
            </button>
          </form>
        )}
      </div>
      <StatusBanner state={state} />
      {connected && !state && (
        <span className="text-xs" style={{ color: "var(--color-text-brand)" }}>Connected</span>
      )}
    </div>
  );
}

export function AccountSettings({
  name,
  email,
  hasPassword,
  connected,
}: {
  name: string;
  email: string;
  hasPassword: boolean;
  connected: { google: boolean; facebook: boolean };
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="card">
        <div className="eyebrow mb-4">Profile</div>
        <ProfileForm name={name} email={email} />
      </section>

      <section className="card">
        <div className="eyebrow mb-4">{hasPassword ? "Change password" : "Set a password"}</div>
        <PasswordForm hasPassword={hasPassword} />
      </section>

      <section className="card">
        <div className="eyebrow mb-4">Connected accounts</div>
        <div className="flex flex-col gap-3">
          <ProviderRow provider="google" label="Google" icon={faGoogle} iconColor="#eeeef5" connected={connected.google} />
          <ProviderRow provider="facebook" label="Facebook" icon={faFacebookF} iconColor="#1877f2" connected={connected.facebook} />
        </div>
      </section>
    </div>
  );
}
