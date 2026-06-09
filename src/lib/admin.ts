// Emails allowed to see/manage admin-only data (e.g. beta access requests).
// Override with ADMIN_EMAILS (comma-separated) in the environment.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "wesley@ahlfeldsolutions.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
