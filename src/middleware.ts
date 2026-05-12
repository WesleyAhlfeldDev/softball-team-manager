import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // NextAuth v5 renamed the cookie from "next-auth.session-token" to "authjs.session-token"
  // On HTTPS (production) it gets the __Secure- prefix automatically.
  const secureCookie = req.nextUrl.protocol === "https:";
  const cookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? "",
    cookieName,
  });

  const isLoggedIn  = !!token;
  const { pathname } = req.nextUrl;
  const isAuthPage  = pathname.startsWith("/login");
  const isApiAuth   = pathname.startsWith("/api/auth");
  const isRoot      = pathname === "/";

  if (isApiAuth) return NextResponse.next();

  if (isRoot) {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/dashboard" : "/login", req.nextUrl)
    );
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
