import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface AppSession {
  user: { id: string; email: string; name: string };
}

/**
 * Returns the authenticated user's session. Routes are already gated by
 * middleware; this is the server-side guard for pages/actions. If there is no
 * session (e.g. token expired), redirect to the login screen.
 */
export async function getSession(): Promise<AppSession> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "",
    },
  };
}

/**
 * Redirect to /welcome if the user is still on a temporary password. Call this
 * in protected layouts/pages. DB-read based, so it clears immediately once the
 * user sets a real password (no JWT staleness). /welcome must NOT call this.
 */
export async function requirePasswordChanged(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mustChangePassword: true },
  });
  if (user?.mustChangePassword) redirect("/welcome");
}
