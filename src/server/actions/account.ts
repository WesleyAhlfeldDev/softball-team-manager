"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { signIn } from "@/lib/auth";

export type AccountState = { ok: string } | { error: string } | undefined;

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
});

export async function updateProfileAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getSession();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findFirst({
    where: { email, id: { not: session.user.id } },
    select: { id: true },
  });
  if (taken) return { error: "That email is already in use." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, email },
  });
  revalidatePath("/account");
  return { ok: "Profile updated. Your new email applies the next time you log in." };
}

const passwordSchema = z
  .object({
    current: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getSession();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current") || undefined,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  // If the user already has a password, verify the current one.
  if (user?.passwordHash) {
    if (!parsed.data.current) return { error: "Enter your current password." };
    const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
    if (!ok) return { error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePassword: false, tempPasswordExpires: null },
  });
  return { ok: "Password updated." };
}

/** Start linking an OAuth provider to the current account. */
export async function connectProviderAction(formData: FormData) {
  await getSession();
  const provider = String(formData.get("provider"));
  if (provider !== "google" && provider !== "facebook") return;
  await signIn(provider, { redirectTo: "/account" });
}

export async function disconnectProviderAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getSession();
  const provider = String(formData.get("provider"));
  if (provider !== "google" && provider !== "facebook") {
    return { error: "Unknown provider." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, accounts: { select: { provider: true } } },
  });
  if (!user) return { error: "Account not found." };

  const isConnected = user.accounts.some((a) => a.provider === provider);
  if (!isConnected) return { error: "That account isn't connected." };

  const loginMethods = (user.passwordHash ? 1 : 0) + user.accounts.length;
  if (loginMethods <= 1) {
    return {
      error: "You can't remove your only login method. Set a password or connect another account first.",
    };
  }

  await prisma.account.deleteMany({ where: { userId: session.user.id, provider } });
  revalidatePath("/account");
  return { ok: `${provider === "google" ? "Google" : "Facebook"} disconnected.` };
}
