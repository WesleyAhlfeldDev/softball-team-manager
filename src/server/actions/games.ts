"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { GameStatus } from "@prisma/client";

const gameSchema = z.object({
  opponent:     z.string().min(1, "Opponent name is required").max(100),
  gameDate:     z.string().min(1, "Date is required"),
  gameTime:     z.string().optional(),
  location:     z.string().max(200).optional(),
  isHome:       z.boolean().nullable().default(null),
  totalInnings: z.coerce.number().int().min(1).max(15).default(7),
  notes:        z.string().max(500).optional(),
});

async function getTeamContext() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const team = await prisma.team.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      seasons: { where: { isActive: true }, select: { id: true } },
    },
  });
  if (!team) throw new Error("No team found");
  const activeSeasonId = team.seasons[0]?.id;
  if (!activeSeasonId) throw new Error("No active season — create a season first");
  return { teamId: team.id, activeSeasonId };
}

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

export async function addGame(formData: FormData) {
  const { teamId, activeSeasonId } = await getTeamContext();

  const parsed = gameSchema.safeParse({
    opponent:     formData.get("opponent"),
    gameDate:     formData.get("gameDate"),
    gameTime:     formData.get("gameTime") || undefined,
    location:     formData.get("location") || undefined,
    isHome:       formData.get("isHome") === "null" ? null : formData.get("isHome") === "true",
    totalInnings: formData.get("totalInnings") || 7,
    notes:        formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const { gameDate, gameTime, ...rest } = parsed.data;
  const dateTimeStr = gameTime
    ? `${gameDate}T${gameTime}:00`
    : `${gameDate}T00:00:00`;
  const gameDateObj = new Date(dateTimeStr);

  await prisma.game.create({
    data: {
      teamId,
      seasonId: activeSeasonId,
      gameDate: gameDateObj,
      opponent: rest.opponent, isHome: rest.isHome, totalInnings: rest.totalInnings,
      location: rest.location ?? null, notes: rest.notes ?? null,
    },
  });

  revalidatePath("/schedule");
  return { success: true };
}

export async function updateGame(gameId: string, formData: FormData) {
  const teamId = await getTeamId();

  const parsed = gameSchema.safeParse({
    opponent:     formData.get("opponent"),
    gameDate:     formData.get("gameDate"),
    gameTime:     formData.get("gameTime") || undefined,
    location:     formData.get("location") || undefined,
    isHome:       formData.get("isHome") === "null" ? null : formData.get("isHome") === "true",
    totalInnings: formData.get("totalInnings") || 7,
    notes:        formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const { gameDate, gameTime, ...rest } = parsed.data;
  const dateTimeStr = gameTime
    ? `${gameDate}T${gameTime}:00`
    : `${gameDate}T00:00:00`;
  const gameDateObj = new Date(dateTimeStr);

  await prisma.game.update({
    where: { id: gameId, teamId },
    data: {
      gameDate: gameDateObj,
      opponent: rest.opponent, isHome: rest.isHome, totalInnings: rest.totalInnings,
      location: rest.location ?? null, notes: rest.notes ?? null,
    },
  });

  revalidatePath("/schedule");
  return { success: true };
}

export async function deleteGame(gameId: string) {
  const teamId = await getTeamId();
  await prisma.game.delete({ where: { id: gameId, teamId } });
  revalidatePath("/schedule");
  return { success: true };
}

export async function updateGameStatus(gameId: string, status: GameStatus) {
  const teamId = await getTeamId();
  await prisma.game.update({
    where: { id: gameId, teamId },
    data: { status },
  });
  revalidatePath("/schedule");
  return { success: true };
}

export async function setGameHomeAway(gameId: string, isHome: boolean) {
  const teamId = await getTeamId();
  await prisma.game.update({
    where: { id: gameId, teamId },
    data: { isHome },
  });
  revalidatePath("/schedule");
  return { success: true };
}

export async function logGameScore(
  gameId: string,
  teamRuns: number,
  opponentRuns: number
) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  await prisma.game.update({
    where: { id: gameId, teamId },
    data: {
      teamRuns,
      opponentRuns,
      status: "FINAL",
      completedAt: new Date(),
    },
  });

  const won  = teamRuns > opponentRuns;
  const lost = teamRuns < opponentRuns;

  await prisma.teamSeasonStats.upsert({
    where: { seasonId: game.seasonId },
    create: {
      seasonId:    game.seasonId,
      wins:        won  ? 1 : 0,
      losses:      lost ? 1 : 0,
      runsScored:  teamRuns,
      runsAllowed: opponentRuns,
      runDiff:     teamRuns - opponentRuns,
    },
    update: {
      ...(won  && { wins:   { increment: 1 } }),
      ...(lost && { losses: { increment: 1 } }),
      runsScored:  { increment: teamRuns },
      runsAllowed: { increment: opponentRuns },
      runDiff:     { increment: teamRuns - opponentRuns },
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}
