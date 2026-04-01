"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GameStatus, PlateAppearanceResult } from "@prisma/client";

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

// ── Start game ─────────────────────────────────────────────────
export async function startGame(gameId: string) {
  const teamId = await getTeamId();
  await prisma.game.update({
    where: { id: gameId, teamId },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
  });

  // Create inning 1
  await prisma.inning.upsert({
    where: { gameId_inningNumber: { gameId, inningNumber: 1 } },
    create: { gameId, inningNumber: 1 },
    update: {},
  });

  await prisma.playEvent.create({
    data: { gameId, type: "GAME_START", description: "Game started" },
  });

  revalidatePath(`/scorebook/${gameId}`);
  return { success: true };
}

// ── Record a plate appearance ──────────────────────────────────
export async function recordPlateAppearance(data: {
  gameId: string;
  playerId: string;
  inningNumber: number;
  battingOrderSlot: number;
  atBatNumber: number;
  result: PlateAppearanceResult;
  rbis: number;
  runsScored: boolean;
}) {
  const teamId = await getTeamId();

  const game = await prisma.game.findFirst({
    where: { id: data.gameId, teamId },
    include: { innings: { where: { inningNumber: data.inningNumber } } },
  });
  if (!game) return { error: "Game not found" };

  // Ensure inning exists
  const inning = await prisma.inning.upsert({
    where: { gameId_inningNumber: { gameId: data.gameId, inningNumber: data.inningNumber } },
    create: { gameId: data.gameId, inningNumber: data.inningNumber },
    update: {},
  });

  // Record plate appearance
  await prisma.plateAppearance.create({
    data: {
      gameId:           data.gameId,
      playerId:         data.playerId,
      inningNumber:     data.inningNumber,
      battingOrderSlot: data.battingOrderSlot,
      atBatNumber:      data.atBatNumber,
      result:           data.result,
      rbis:             data.rbis,
      runsScored:       data.runsScored,
    },
  });

  // Determine if it's an at-bat (not walk, sac fly, HBP)
  const isAtBat = !["WALK", "HIT_BY_PITCH", "SAC_FLY", "SAC_BUNT"].includes(data.result);
  const isHit   = ["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(data.result);

  // Build human-readable description
  const resultLabels: Record<PlateAppearanceResult, string> = {
    SINGLE:          "1B",
    DOUBLE:          "2B",
    TRIPLE:          "3B",
    HOME_RUN:        "HR",
    GROUNDOUT:       "GO",
    FLYOUT:          "FO",
    LINEOUT:         "LO",
    POPOUT:          "PO",
    STRIKEOUT:       "K",
    WALK:            "BB",
    HIT_BY_PITCH:    "HBP",
    REACHED_ON_ERROR:"ROE",
    SAC_FLY:         "SAC",
    SAC_BUNT:        "SB",
    FIELDERS_CHOICE: "FC",
    DOUBLE_PLAY:     "DP",
    TRIPLE_PLAY:     "TP",
  };

  const player = await prisma.player.findUnique({
    where: { id: data.playerId },
    select: { firstName: true, lastName: true },
  });

  const desc = [
    `${player?.firstName ?? ""} ${player?.lastName ?? ""} — ${resultLabels[data.result]}`,
    data.rbis > 0 ? `${data.rbis} RBI` : null,
    data.runsScored ? "Run scored" : null,
  ].filter(Boolean).join(", ");

  await prisma.playEvent.create({
    data: {
      gameId:      data.gameId,
      inningId:    inning.id,
      type:        "PLATE_APPEARANCE",
      inningNumber: data.inningNumber,
      description: desc,
    },
  });

  // Update inning runs + hits
  if (data.rbis > 0 || data.runsScored) {
    await prisma.inning.update({
      where: { id: inning.id },
      data: {
        teamRuns: { increment: data.rbis },
        teamHits: isHit ? { increment: 1 } : undefined,
      },
    });
  } else if (isHit) {
    await prisma.inning.update({
      where: { id: inning.id },
      data: { teamHits: { increment: 1 } },
    });
  }

  // Update game totals
  await prisma.game.update({
    where: { id: data.gameId },
    data: {
      teamRuns: { increment: data.rbis },
      teamHits: isHit ? { increment: 1 } : undefined,
    },
  });

  revalidatePath(`/scorebook/${data.gameId}`);
  return { success: true };
}

// ── Undo last plate appearance ─────────────────────────────────
export async function undoLastPlateAppearance(gameId: string) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  const last = await prisma.plateAppearance.findFirst({
    where: { gameId },
    orderBy: { createdAt: "desc" },
  });
  if (!last) return { error: "Nothing to undo" };

  const isHit = ["SINGLE","DOUBLE","TRIPLE","HOME_RUN"].includes(last.result);

  // Reverse game totals
  await prisma.game.update({
    where: { id: gameId },
    data: {
      teamRuns: { decrement: last.rbis },
      teamHits: isHit ? { decrement: 1 } : undefined,
    },
  });

  // Reverse inning totals
  const inning = await prisma.inning.findFirst({
    where: { gameId, inningNumber: last.inningNumber },
  });
  if (inning) {
    await prisma.inning.update({
      where: { id: inning.id },
      data: {
        teamRuns: { decrement: last.rbis },
        teamHits: isHit ? { decrement: 1 } : undefined,
      },
    });
  }

  // Delete last play event
  await prisma.playEvent.deleteMany({
    where: { gameId, type: "PLATE_APPEARANCE", inningNumber: last.inningNumber },
  });

  await prisma.plateAppearance.delete({ where: { id: last.id } });

  revalidatePath(`/scorebook/${gameId}`);
  return { success: true, undoneResult: last.result };
}

// ── Update opponent score ──────────────────────────────────────
export async function updateOpponentScore(gameId: string, inningNumber: number, runs: number) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  const inning = await prisma.inning.upsert({
    where: { gameId_inningNumber: { gameId, inningNumber } },
    create: { gameId, inningNumber, opponentRuns: Math.max(0, runs) },
    update: { opponentRuns: Math.max(0, runs) },
  });

  // Recalculate total opponent runs from all innings
  const innings = await prisma.inning.findMany({ where: { gameId } });
  const totalOpponentRuns = innings.reduce((sum, inn) => sum + inn.opponentRuns, 0);

  await prisma.game.update({
    where: { id: gameId },
    data: { opponentRuns: totalOpponentRuns },
  });

  revalidatePath(`/scorebook/${gameId}`);
  return { success: true };
}

// ── Next inning ────────────────────────────────────────────────
export async function nextInning(gameId: string, currentInning: number) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  // Mark current inning complete
  await prisma.inning.updateMany({
    where: { gameId, inningNumber: currentInning },
    data: { isComplete: true },
  });

  const nextInn = currentInning + 1;

  // Create next inning
  await prisma.inning.upsert({
    where: { gameId_inningNumber: { gameId, inningNumber: nextInn } },
    create: { gameId, inningNumber: nextInn },
    update: {},
  });

  await prisma.playEvent.create({
    data: {
      gameId,
      type: "INNING_START",
      inningNumber: nextInn,
      description: `Inning ${nextInn} started`,
    },
  });

  revalidatePath(`/scorebook/${gameId}`);
  return { success: true, nextInning: nextInn };
}

// ── End game + calculate stats ─────────────────────────────────
export async function endGame(gameId: string) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId },
    include: {
      plateAppearances: { include: { player: true } },
      innings: true,
    },
  });
  if (!game) return { error: "Game not found" };

  // ── Calculate per-player stats ──────────────────────────────
  const playerMap = new Map<string, {
    atBats: number; plateAppearances: number; hits: number;
    singles: number; doubles: number; triples: number; homeRuns: number;
    rbi: number; runs: number; walks: number; strikeouts: number;
    sacFlies: number; reachedOnError: number;
  }>();

  for (const pa of game.plateAppearances) {
    if (!playerMap.has(pa.playerId)) {
      playerMap.set(pa.playerId, {
        atBats: 0, plateAppearances: 0, hits: 0, singles: 0,
        doubles: 0, triples: 0, homeRuns: 0, rbi: 0, runs: 0,
        walks: 0, strikeouts: 0, sacFlies: 0, reachedOnError: 0,
      });
    }
    const s = playerMap.get(pa.playerId)!;
    s.plateAppearances++;
    s.rbi += pa.rbis;
    if (pa.runsScored) s.runs++;

    const isAB = !["WALK","HIT_BY_PITCH","SAC_FLY","SAC_BUNT"].includes(pa.result);
    if (isAB) s.atBats++;

    switch (pa.result) {
      case "SINGLE":          s.hits++; s.singles++;    break;
      case "DOUBLE":          s.hits++; s.doubles++;    break;
      case "TRIPLE":          s.hits++; s.triples++;    break;
      case "HOME_RUN":        s.hits++; s.homeRuns++;   break;
      case "WALK":            s.walks++;                break;
      case "STRIKEOUT":       s.strikeouts++;           break;
      case "SAC_FLY":         s.sacFlies++;             break;
      case "REACHED_ON_ERROR":s.reachedOnError++;       break;
    }
  }

  // Save per-game stats and update season totals
  for (const [playerId, stats] of playerMap.entries()) {
    const ab  = stats.atBats;
    const h   = stats.hits;
    const bb  = stats.walks;
    const sf  = stats.sacFlies;
    const pa  = stats.plateAppearances;

    const battingAvg = ab > 0 ? h / ab : null;
    const slugging   = ab > 0
      ? (stats.singles + 2*stats.doubles + 3*stats.triples + 4*stats.homeRuns) / ab
      : null;
    const obp = (ab + bb + sf) > 0
      ? (h + bb) / (ab + bb + sf)
      : null;
    const ops = obp !== null && slugging !== null ? obp + slugging : null;

    // Upsert game stats
    await prisma.playerGameStats.upsert({
      where: { gameId_playerId: { gameId, playerId } },
      create: { gameId, playerId, ...stats, battingAvg, slugging, obp, ops },
      update: { ...stats, battingAvg, slugging, obp, ops },
    });

    // Update season stats
    const season = await prisma.playerSeasonStats.findUnique({ where: { playerId } });
    if (season) {
      const newAB   = season.atBats + ab;
      const newH    = season.hits + h;
      const newBB   = season.walks + bb;
      const newSF   = season.sacFlies + sf;
      const newSLG1 = season.singles + stats.singles;
      const newSLG2 = season.doubles + stats.doubles;
      const newSLG3 = season.triples + stats.triples;
      const newHR   = season.homeRuns + stats.homeRuns;

      const sAvg = newAB > 0 ? newH / newAB : null;
      const sSlg = newAB > 0
        ? (newSLG1 + 2*newSLG2 + 3*newSLG3 + 4*newHR) / newAB : null;
      const sObp = (newAB + newBB + newSF) > 0
        ? (newH + newBB) / (newAB + newBB + newSF) : null;
      const sOps = sObp !== null && sSlg !== null ? sObp + sSlg : null;

      await prisma.playerSeasonStats.update({
        where: { playerId },
        data: {
          gamesPlayed:     { increment: 1 },
          atBats:          { increment: ab },
          plateAppearances:{ increment: pa },
          hits:            { increment: h },
          singles:         { increment: stats.singles },
          doubles:         { increment: stats.doubles },
          triples:         { increment: stats.triples },
          homeRuns:        { increment: stats.homeRuns },
          rbi:             { increment: stats.rbi },
          runs:            { increment: stats.runs },
          walks:           { increment: stats.walks },
          strikeouts:      { increment: stats.strikeouts },
          sacFlies:        { increment: stats.sacFlies },
          reachedOnError:  { increment: stats.reachedOnError },
          battingAvg:      sAvg,
          slugging:        sSlg,
          obp:             sObp,
          ops:             sOps,
        },
      });
    }
  }

  // Update team season stats
  const won = game.teamRuns > game.opponentRuns;
  const lost = game.teamRuns < game.opponentRuns;

  await prisma.teamSeasonStats.updateMany({
    where: { teamId },
    data: {
      wins:        won  ? { increment: 1 } : undefined,
      losses:      lost ? { increment: 1 } : undefined,
      runsScored:  { increment: game.teamRuns },
      runsAllowed: { increment: game.opponentRuns },
      runDiff:     { increment: game.teamRuns - game.opponentRuns },
    },
  });

  // Mark game final
  await prisma.game.update({
    where: { id: gameId },
    data: { status: "FINAL", completedAt: new Date() },
  });

  await prisma.playEvent.create({
    data: { gameId, type: "GAME_END", description: "Game ended" },
  });

  revalidatePath(`/scorebook/${gameId}`);
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { success: true };
}

// ── Restart game ───────────────────────────────────────────────
export async function restartGame(gameId: string) {
  const teamId = await getTeamId();
  const game = await prisma.game.findFirst({ where: { id: gameId, teamId } });
  if (!game) return { error: "Game not found" };

  // Delete all scorebook data for this game
  await prisma.playEvent.deleteMany({ where: { gameId } });
  await prisma.plateAppearance.deleteMany({ where: { gameId } });
  await prisma.playerGameStats.deleteMany({ where: { gameId } });
  await prisma.inning.deleteMany({ where: { gameId } });

  // Reset game scores and status
  await prisma.game.update({
    where: { id: gameId },
    data: {
      status:         "SCHEDULED",
      teamRuns:       0,
      opponentRuns:   0,
      teamHits:       0,
      opponentHits:   0,
      teamErrors:     0,
      opponentErrors: 0,
      startedAt:      null,
      completedAt:    null,
    },
  });

  revalidatePath(`/scorebook/${gameId}`);
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { success: true };
}
