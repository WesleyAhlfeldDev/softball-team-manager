"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

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
  await notifyOwner({ name, email, message });

  return { ok: true };
}

/** Mark a request as invited/declined. Owner-only (called from the dashboard). */
export async function resolveAccessRequestAction(formData: FormData) {
  await getSession(); // redirects to /login if not authenticated
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || (status !== "invited" && status !== "declined")) return;
  await prisma.accessRequest.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
}

async function notifyOwner(req: { name: string; email: string; message: string | undefined }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.ACCESS_REQUEST_NOTIFY_EMAIL ?? "wesley@ahlfeldsolutions.com";
  const from = process.env.RESEND_FROM ?? "Team Manager <onboarding@resend.dev>";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: req.email,
        subject: `New beta access request — ${req.name}`,
        html: `
          <h2>New beta access request</h2>
          <p><strong>Name:</strong> ${escapeHtml(req.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(req.email)}</p>
          ${req.message ? `<p><strong>Message:</strong><br/>${escapeHtml(req.message)}</p>` : ""}
        `,
      }),
    });
  } catch (err) {
    // Don't fail the request if the email provider is down.
    console.error("Failed to send access-request notification email:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
