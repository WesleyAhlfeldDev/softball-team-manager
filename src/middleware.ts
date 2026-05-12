import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/login");
  const isApiAuth  = pathname.startsWith("/api/auth");
  const isRoot     = pathname === "/";

  if (isApiAuth) return NextResponse.next();

  // Check for session cookie existence — actual auth is enforced in server components
  const hasSession =
    !!req.cookies.get("__Secure-authjs.session-token") ||
    !!req.cookies.get("authjs.session-token");

  if (isRoot) {
    return NextResponse.redirect(
      new URL(hasSession ? "/dashboard" : "/login", req.nextUrl)
    );
  }

  // Redirect logged-in users away from login page
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
