import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  if (pathname === "/") {
    const hasSession =
      !!req.cookies.get("__Secure-authjs.session-token") ||
      !!req.cookies.get("authjs.session-token");
    return NextResponse.redirect(
      new URL(hasSession ? "/dashboard" : "/login", req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
