"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { inviteFromAccessRequestAction, type InviteState } from "@/server/actions/access";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-3 py-1.5 text-xs font-bold disabled:opacity-60"
      style={{ background: "var(--color-brand-500)", color: "#07070f" }}
    >
      {pending ? "Inviting…" : "Approve & invite"}
    </button>
  );
}

export function InviteButton({ id }: { id: string }) {
  const [state, action] = useActionState<InviteState, FormData>(
    inviteFromAccessRequestAction,
    undefined,
  );

  if (state && "ok" in state) {
    return (
      <div
        className="rounded-md px-3 py-2 text-xs"
        style={{ background: "var(--color-brand-dim)", color: "var(--color-text-brand)" }}
      >
        Invited! Temp password:{" "}
        <code style={{ fontFamily: "var(--font-mono)" }}>{state.tempPassword}</code>
        <br />
        {state.emailed
          ? "Emailed to them."
          : "Email not configured — copy and share this manually."}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      {state && "error" in state && (
        <p className="text-xs" style={{ color: "var(--color-danger-400)" }}>
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}
