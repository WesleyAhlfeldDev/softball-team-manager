import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      // Link a Google login to an existing account with the same email.
      // Safe here: closed, effectively single-user app.
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        // OAuth-only accounts have no passwordHash — reject credentials login.
        if (!user || !user.passwordHash) return null;

        // An expired temporary (invite) password can no longer be used.
        if (
          user.mustChangePassword &&
          user.tempPasswordExpires &&
          user.tempPasswordExpires.getTime() < Date.now()
        ) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
