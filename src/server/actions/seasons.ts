"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function getSeasons() {
  const teamId = await getTeamId();
  return prisma.season.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSeason(formData: FormData) {
  const teamId = await getTeamId();

  const parsed = z
    .string()
    .min(1, "Season name is required")
    .max(50, "Season name must be 50 characters or less")
    .safeParse(formData.get("name"));

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid name" };
  }

  await prisma.season.updateMany({
    where: { teamId },
    data: { isActive: false },
  });

  await prisma.season.create({
    data: { teamId, name: parsed.data.trim(), isActive: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { success: true };
}

export async function resetSeason() {
  const teamId = await getTeamId();

  const active = await prisma.season.findFirst({
    where: { teamId, isActive: true },
    select: { id: true },
  });
  if (!active) return { error: "No active season to reset" };

  await prisma.game.deleteMany({ where: { seasonId: active.id } });
  await prisma.playerSeasonStats.deleteMany({ where: { seasonId: active.id } });
  await prisma.teamSeasonStats.deleteMany({ where: { seasonId: active.id } });

  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { success: true };
}

export async function finishSeason() {
  const teamId = await getTeamId();

  const active = await prisma.season.findFirst({
    where: { teamId, isActive: true },
  });
  if (!active) return { error: "No active season to finish" };

  await prisma.season.update({
    where: { id: active.id },
    data: { isActive: false, isFinished: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { success: true };
}

export async function clearStats() {
  const teamId = await getTeamId();

  const active = await prisma.season.findFirst({
    where: { teamId, isActive: true },
    select: { id: true },
  });
  if (!active) return { error: "No active season" };

  await prisma.playerSeasonStats.deleteMany({ where: { seasonId: active.id } });
  await prisma.teamSeasonStats.deleteMany({ where: { seasonId: active.id } });

  revalidatePath("/stats");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function seedRandomStats() {
  const teamId = await getTeamId();

  const active = await prisma.season.findFirst({
    where: { teamId, isActive: true },
    select: { id: true },
  });
  if (!active) return { error: "No active season" };

  const players = await prisma.player.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  });
  if (players.length === 0) return { error: "No active players on roster" };

  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  let totalWins = rand(4, 10);
  let totalLosses = rand(2, 8);
  const totalGames = totalWins + totalLosses;
  let teamRunsScored = 0;
  let teamRunsAllowed = 0;

  for (const { id: playerId } of players) {
    const gamesPlayed = rand(Math.max(1, totalGames - 3), totalGames);
    const atBats      = rand(gamesPlayed * 3, gamesPlayed * 4);
    const avgTenths   = rand(150, 380);
    const hits        = Math.round((avgTenths / 1000) * atBats);
    const doubles     = rand(0, Math.floor(hits * 0.25));
    const triples     = rand(0, Math.min(2, Math.floor(hits * 0.05)));
    const homeRuns    = rand(0, Math.floor(hits * 0.18));
    const singles     = Math.max(0, hits - doubles - triples - homeRuns);
    const rbi         = rand(Math.floor(hits * 0.3), Math.floor(hits * 0.9));
    const runs        = rand(Math.floor(hits * 0.3), Math.floor(hits * 0.8));
    const walks       = rand(0, Math.floor(atBats * 0.15));
    const strikeouts  = rand(0, Math.floor(atBats * 0.2));
    const totalBases  = singles + doubles * 2 + triples * 3 + homeRuns * 4;

    teamRunsScored += runs;

    const battingAvg = atBats > 0 ? hits / atBats : 0;
    const obp        = (atBats + walks) > 0 ? (hits + walks) / (atBats + walks) : 0;
    const slugging   = atBats > 0 ? totalBases / atBats : 0;
    const ops        = obp + slugging;

    await prisma.playerSeasonStats.upsert({
      where: { playerId_seasonId: { playerId, seasonId: active.id } },
      create: {
        playerId,
        seasonId: active.id,
        gamesPlayed, atBats, hits, doubles, triples, homeRuns, rbi, runs, walks, strikeouts,
        battingAvg, obp, slugging, ops,
      },
      update: {
        gamesPlayed, atBats, hits, doubles, triples, homeRuns, rbi, runs, walks, strikeouts,
        battingAvg, obp, slugging, ops,
      },
    });
  }

  teamRunsAllowed = rand(
    Math.floor(teamRunsScored * 0.5),
    Math.floor(teamRunsScored * 1.2),
  );

  await prisma.teamSeasonStats.upsert({
    where: { seasonId: active.id },
    create: {
      seasonId: active.id,
      wins: totalWins,
      losses: totalLosses,
      runsScored: teamRunsScored,
      runsAllowed: teamRunsAllowed,
    },
    update: {
      wins: totalWins,
      losses: totalLosses,
      runsScored: teamRunsScored,
      runsAllowed: teamRunsAllowed,
    },
  });

  revalidatePath("/stats");
  return { success: true };
}

export async function setActiveSeason(seasonId: string) {
  const teamId = await getTeamId();

  const season = await prisma.season.findFirst({
    where: { id: seasonId, teamId },
  });
  if (!season) return { error: "Season not found" };

  await prisma.season.updateMany({
    where: { teamId },
    data: { isActive: false },
  });
  await prisma.season.update({
    where: { id: seasonId },
    data: { isActive: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { success: true };
}
