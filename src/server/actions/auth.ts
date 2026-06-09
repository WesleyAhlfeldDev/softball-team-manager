"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createUserWithTeam } from "@/server/users";

export type AuthState = { error: string } | undefined;

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

/** Email/password login via the Credentials provider. */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // signIn throws a redirect on success — re-throw so Next can handle it.
    throw error;
  }
  return undefined;
}

/** Self-serve signup. Gated by ALLOW_SIGNUPS until we open registration. */
export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (process.env.ALLOW_SIGNUPS !== "true") {
    return { error: "Signups are currently closed." };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await createUserWithTeam({ name, email, passwordHash });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }
  return undefined;
}

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

/** Set a real password for the logged-in user (used by the /welcome flow). */
export async function setInitialPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const session = await getSession();
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePassword: false, tempPasswordExpires: null },
  });

  redirect("/dashboard");
}

/** Sign out and return to the landing page. */
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

/** OAuth sign-in (Google / Facebook). */
export async function socialLoginAction(formData: FormData) {
  const provider = String(formData.get("provider"));
  if (provider !== "google" && provider !== "facebook") return;
  await signIn(provider, { redirectTo: "/dashboard" });
}
