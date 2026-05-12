"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { LeagueRules } from "@/types/league-rules";

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

export async function saveLeagueRules(rules: LeagueRules) {
  const teamId = await getTeamId();
  await prisma.team.update({
    where: { id: teamId },
    data: { leagueRules: JSON.stringify(rules) },
  });
  revalidatePath("/dashboard");
  return { success: true };
}
