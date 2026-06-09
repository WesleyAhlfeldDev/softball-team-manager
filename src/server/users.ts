import { prisma } from "@/lib/db";

interface NewUserData {
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  mustChangePassword?: boolean;
  tempPasswordExpires?: Date | null;
}

/**
 * Create a user together with a starter team in one transaction, so a new
 * account is never left without a team (every protected page needs one).
 * Returns the created user.
 */
export async function createUserWithTeam(data: NewUserData) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name ?? null,
      passwordHash: data.passwordHash ?? null,
      mustChangePassword: data.mustChangePassword ?? false,
      tempPasswordExpires: data.tempPasswordExpires ?? null,
      teams: {
        create: { name: "My Team" },
      },
    },
  });
}
