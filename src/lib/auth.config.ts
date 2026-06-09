import type { NextAuthConfig } from "next-auth";

// Routes that are reachable without a session.
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

// Signups are closed. OAuth sign-in is allowed for existing/invited users (see
// the signIn callback in auth.ts) and, as a fallback for brand-new OAuth
// accounts, these email domains. Credentials login is unaffected.
export const ALLOWED_OAUTH_DOMAINS = [
  "ahlfeldsolutions.com",
  "wesleyahlfeld.me",
  "okwustudents.edu",
];

// Lightweight config with no Prisma — safe for Edge Runtime (middleware)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    // NOTE: the signIn callback lives in auth.ts (it needs Prisma, which isn't
    // available in the Edge middleware that imports this config).
    // Used by middleware to gate routes. `auth` is null when logged out.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isPublic =
        PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/auth");

      // Logged-in users shouldn't sit on the auth screens.
      if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (isPublic) return true;

      // Protected route + no session → NextAuth redirects to the signIn page.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      // `user` is only present on sign-in (credentials authorize() return, or
      // the adapter user for OAuth). Persist its id/email/name onto the token.
      if (user) {
        token.id = user.id;
        token.email = user.email ?? null;
        token.name = user.name ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: [],
};
