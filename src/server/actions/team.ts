"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const teamInfoSchema = z.object({
  name:      z.string().min(1, "Team name is required").max(100),
  season:    z.string().min(1, "Season is required").max(50),
  league:    z.string().max(100).optional(),
  homeField: z.string().max(200).optional(),
  teamColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl:   z.string().optional(),
});

async function getTeamId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const team = await prisma.team.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!team) throw new Error("No team found");
  return team.id;
}

export async function saveTeamInfo(formData: FormData) {
  const teamId = await getTeamId();

  const parsed = teamInfoSchema.safeParse({
    name:      formData.get("name"),
    season:    formData.get("season"),
    league:    formData.get("league") || undefined,
    homeField: formData.get("homeField") || undefined,
    teamColor: formData.get("teamColor") || undefined,
    logoUrl:   formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  await prisma.team.update({
    where: { id: teamId },
    data: parsed.data,
  });

  revalidatePath("/dashboard");
  return { success: true };
}
