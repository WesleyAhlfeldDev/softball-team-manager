"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const teamInfoSchema = z.object({
  name:      z.string().min(1, "Team name is required").max(100),
  league:    z.string().max(100).optional(),
  homeField: z.string().max(200).optional(),
  teamColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl:   z.string().optional(),
});

async function getTeamId() {
  const session = await getSession();
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
    league:    formData.get("league") || undefined,
    homeField: formData.get("homeField") || undefined,
    teamColor: formData.get("teamColor") || undefined,
    logoUrl:   formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const { league, homeField, teamColor, logoUrl, ...required } = parsed.data;
  await prisma.team.update({
    where: { id: teamId },
    data: {
      ...required,
      league:    league    ?? null,
      homeField: homeField ?? null,
      teamColor: teamColor ?? null,
      logoUrl:   logoUrl   ?? null,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
