"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { sendEmail, escapeHtml } from "@/lib/email";
import { createUserWithTeam } from "@/server/users";

export type AccessRequestState = { ok: true } | { error: string } | undefined;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address."),
  message: z.string().trim().max(1000).optional(),
});

/** Public beta-access request from the landing page. */
export async function requestAccessAction(
  _prev: AccessRequestState,
  formData: FormData,
): Promise<AccessRequestState> {
  // Honeypot: real users never fill this hidden field; bots often do.
  if ((formData.get("company") as string)?.trim()) {
    return { ok: true }; // silently accept without saving
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, message } = parsed.data;

  try {
    await prisma.accessRequest.create({ data: { name, email, message: message ?? null } });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  // Best-effort email notification (no-op until RESEND_API_KEY is set).
  const notifyTo = process.env.ACCESS_REQUEST_NOTIFY_EMAIL ?? "wesley@ahlfeldsolutions.com";
  await sendEmail({
    to: notifyTo,
    replyTo: email,
    subject: `New beta access request — ${name}`,
    html: `
      <h2>New beta access request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${message ? `<p><strong>Message:</strong><br/>${escapeHtml(message)}</p>` : ""}
    `,
  });

  return { ok: true };
}

/** Mark a request as declined. Admin-only (called from the dashboard). */
export async function resolveAccessRequestAction(formData: FormData) {
  const session = await getSession();
  if (!isAdminEmail(session.user.email)) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || (status !== "invited" && status !== "declined")) return;
  await prisma.accessRequest.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
}

export type InviteState =
  | { ok: true; tempPassword: string; emailed: boolean }
  | { error: string }
  | undefined;

const TEMP_PASSWORD_TTL_DAYS = 7;

/**
 * Approve a beta request: create the user (with a starter team) + a temporary
 * password they must change on first login, and email them the credentials.
 * Admin-only.
 */
export async function inviteFromAccessRequestAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const session = await getSession();
  if (!isAdminEmail(session.user.email)) return { error: "Not authorized." };

  const id = String(formData.get("id"));
  const request = await prisma.accessRequest.findUnique({ where: { id } });
  if (!request) return { error: "Request not found." };

  const email = request.email.trim().toLowerCase();

  // Generate a fresh temp password (used for both new and re-issued invites).
  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const tempPasswordExpires = new Date(Date.now() + TEMP_PASSWORD_TTL_DAYS * 24 * 60 * 60 * 1000);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !existing.mustChangePassword) {
    // Already activated their own password — don't reset it.
    await prisma.accessRequest.update({ where: { id }, data: { status: "invited" } });
    return { error: `${email} already has an active account.` };
  }

  if (existing) {
    // Invited before but hasn't set a password yet — re-issue a new temp one.
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, mustChangePassword: true, tempPasswordExpires },
    });
  } else {
    await createUserWithTeam({
      email,
      name: request.name,
      passwordHash,
      mustChangePassword: true,
      tempPasswordExpires,
    });
  }

  await prisma.accessRequest.update({ where: { id }, data: { status: "invited" } });

  const loginUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/login`;
  const { sent } = await sendEmail({
    to: email,
    subject: "You're in — your Team Manager beta login",
    html: `
      <h2>Welcome to the Team Manager beta!</h2>
      <p>Here are your temporary login credentials. You'll be asked to set your own
      password the first time you log in.</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}<br/>
      <strong>Temporary password:</strong> ${escapeHtml(tempPassword)}</p>
      <p><a href="${loginUrl}">Log in here</a></p>
      <p style="color:#888;font-size:12px">This temporary password expires in
      ${TEMP_PASSWORD_TTL_DAYS} days.</p>
    `,
  });

  // NOTE: intentionally no revalidatePath here — revalidating would re-render
  // the dashboard, drop this now-"invited" request from the pending list, and
  // unmount the UI showing the one-time temp password before it can be read.
  return { ok: true, tempPassword, emailed: sent };
}
