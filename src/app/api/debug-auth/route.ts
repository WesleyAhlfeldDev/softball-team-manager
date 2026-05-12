import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const allCookies = cookieStore.getAll();

  let session = null;
  let authError: string | null = null;
  try {
    session = await auth();
  } catch (e) {
    authError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    session: session ? { email: session.user?.email, id: session.user?.id } : null,
    authError,
    cookieNames: allCookies.map((c) => c.name),
    hasSessionCookie: allCookies.some((c) => c.name.includes("session-token")),
    forwardedProto: headerStore.get("x-forwarded-proto"),
    host: headerStore.get("host"),
    authSecret: process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : "NOT SET",
    nextauthSecret: process.env.NEXTAUTH_SECRET ? `set (${process.env.NEXTAUTH_SECRET.length} chars)` : "NOT SET",
  });
}
