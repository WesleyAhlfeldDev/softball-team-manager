"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { FieldingPosition } from "@prisma/client";

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

export interface LineupSlotInput {
  playerId: string;
  battingOrder: number;
  fieldingPosition: FieldingPosition;
  inningPositions?: Record<number, FieldingPosition>;
}

export async function saveDefaultLineup(slots: LineupSlotInput[]) {
  const teamId = await getTeamId();
  await prisma.team.update({
    where: { id: teamId },
    data: { defaultLineup: JSON.stringify(slots) },
  });
  revalidatePath("/lineup");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function applyLineupToGame(gameId: string, slots: LineupSlotInput[]) {
  const teamId = await getTeamId();

  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  await prisma.lineupSlot.deleteMany({ where: { gameId } });

  await prisma.lineupSlot.createMany({
    data: slots.map((s) => ({
      gameId,
      playerId: s.playerId,
      battingOrder: s.battingOrder,
      fieldingPosition: s.fieldingPosition,
      // Store inning positions as JSON in notes field for now
      // (can be a proper relation in a future migration)
    })),
  });

  revalidatePath("/lineup");
  revalidatePath("/schedule");
  return { success: true };
}

export async function updateInningPositions(
  gameId: string,
  updates: { playerId: string; battingOrder: number; fieldingPosition: FieldingPosition; inningPositions: Record<number, FieldingPosition> }[]
) {
  const teamId = await getTeamId();

  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { defaultLineup: true } });

  interface SavedSlot {
    playerId: string;
    battingOrder: number;
    fieldingPosition: FieldingPosition;
    inningPositions?: Record<number, FieldingPosition>;
  }
  let defaultSlots: SavedSlot[] = [];
  if (team?.defaultLineup) {
    try { defaultSlots = JSON.parse(team.defaultLineup as string); } catch {}
  }

  for (const update of updates) {
    const existing = defaultSlots.find((s) => s.playerId === update.playerId);
    if (existing) {
      existing.inningPositions = update.inningPositions;
    } else {
      defaultSlots.push({
        playerId: update.playerId,
        battingOrder: update.battingOrder,
        fieldingPosition: update.fieldingPosition,
        inningPositions: update.inningPositions,
      });
    }
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { defaultLineup: JSON.stringify(defaultSlots) },
  });

  revalidatePath("/lineup");
  revalidatePath("/lineup/sheet");
  return { success: true };
}

export async function getGameLineup(gameId: string) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId },
    include: {
      lineup: {
        orderBy: { battingOrder: "asc" },
        include: { player: true },
      },
    },
  });
  return game?.lineup ?? [];
}
