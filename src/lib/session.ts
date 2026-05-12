import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export interface AppSession {
  user: { id: string; email: string; name: string };
}

export async function getSession(): Promise<AppSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get("app-session")?.value;
  if (!token) redirect("/login");

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
      },
    };
  } catch {
    redirect("/login");
  }
}
