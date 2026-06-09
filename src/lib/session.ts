import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
