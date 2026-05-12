import { prisma } from "@/lib/db";

export interface AppSession {
  user: { id: string; email: string; name: string };
}

export async function getSession(): Promise<AppSession> {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found in database");
  return {
    user: { id: user.id, email: user.email, name: user.name ?? "" },
  };
}
