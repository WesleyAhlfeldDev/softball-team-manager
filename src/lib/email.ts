// Minimal Resend email helper. No-op (returns { sent: false }) until
// RESEND_API_KEY is configured, so callers can degrade gracefully.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false };

  const from = process.env.RESEND_FROM ?? "Team Manager <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
      }),
    });
    return { sent: res.ok };
  } catch (err) {
    console.error("sendEmail failed:", err);
    return { sent: false };
  }
}
