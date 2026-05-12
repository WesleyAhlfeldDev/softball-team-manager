"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { PlateAppearanceResult } from "@prisma/client";

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

// ── Start game ─────────────────────────────────────────────────
export async function startGame(gameId: string) {
  const teamId = await getTeamId();
  await prisma.game.update({
    where: { id: gameId, teamId },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
  });

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
  scoredRunnerIds: string[];
}) {
  const teamId = await getTeamId();

  const game = await prisma.game.findFirst({
    where: { id: data.gameId, teamId },
    include: { innings: { where: { inningNumber: data.inningNumber } } },
  });
  if (!game) return { error: "Game not found" };

  const inning = await prisma.inning.upsert({
    where: { gameId_inningNumber: { gameId: data.gameId, inningNumber: data.inningNumber } },
    create: { gameId: data.gameId, inningNumber: data.inningNumber },
    update: {},
  });

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
      scoredRunnerIds:  data.scoredRunnerIds,
    },
  });

  const isHit = ["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(data.result);

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
      gameId:       data.gameId,
      inningId:     inning.id,
      type:         "PLATE_APPEARANCE",
      inningNumber: data.inningNumber,
      description:  desc,
    },
  });

  if (data.rbis > 0 || data.runsScored) {
    await prisma.inning.update({
      where: { id: inning.id },
      data: {
        teamRuns: { increment: data.rbis },
        ...(isHit && { teamHits: { increment: 1 } }),
      },
    });
  } else if (isHit) {
    await prisma.inning.update({
      where: { id: inning.id },
      data: { teamHits: { increment: 1 } },
    });
  }

  await prisma.game.update({
    where: { id: data.gameId },
    data: {
      teamRuns: { increment: data.rbis },
      ...(isHit && { teamHits: { increment: 1 } }),
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

  await prisma.game.update({
    where: { id: gameId },
    data: {
      teamRuns: { decrement: last.rbis },
      ...(isHit && { teamHits: { decrement: 1 } }),
    },
  });

  const inning = await prisma.inning.findFirst({
    where: { gameId, inningNumber: last.inningNumber },
  });
  if (inning) {
    await prisma.inning.update({
      where: { id: inning.id },
      data: {
        teamRuns: { decrement: last.rbis },
        ...(isHit && { teamHits: { decrement: 1 } }),
      },
    });
  }

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

  await prisma.inning.upsert({
    where: { gameId_inningNumber: { gameId, inningNumber } },
    create: { gameId, inningNumber, opponentRuns: Math.max(0, runs) },
    update: { opponentRuns: Math.max(0, runs) },
  });

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

  await prisma.inning.updateMany({
    where: { gameId, inningNumber: currentInning },
    data: { isComplete: true },
  });

  const nextInn = currentInning + 1;

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

  const seasonId = game.seasonId;

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
    // runs are attributed to whoever actually scored (tracked in scoredRunnerIds)
    for (const runnerId of (pa.scoredRunnerIds ?? [])) {
      if (!playerMap.has(runnerId)) {
        playerMap.set(runnerId, {
          atBats: 0, plateAppearances: 0, hits: 0, singles: 0,
          doubles: 0, triples: 0, homeRuns: 0, rbi: 0, runs: 0,
          walks: 0, strikeouts: 0, sacFlies: 0, reachedOnError: 0,
        });
      }
      playerMap.get(runnerId)!.runs++;
    }

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

  for (const [playerId, stats] of playerMap.entries()) {
    const ab = stats.atBats;
    const h  = stats.hits;
    const bb = stats.walks;
    const sf = stats.sacFlies;
    const pa = stats.plateAppearances;

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

    // Create or update season stats
    const existing = await prisma.playerSeasonStats.findUnique({
      where: { playerId_seasonId: { playerId, seasonId } },
    });

    if (existing) {
      const newAB   = existing.atBats + ab;
      const newH    = existing.hits + h;
      const newBB   = existing.walks + bb;
      const newSF   = existing.sacFlies + sf;
      const newSLG1 = existing.singles + stats.singles;
      const newSLG2 = existing.doubles + stats.doubles;
      const newSLG3 = existing.triples + stats.triples;
      const newHR   = existing.homeRuns + stats.homeRuns;

      const sAvg = newAB > 0 ? newH / newAB : null;
      const sSlg = newAB > 0
        ? (newSLG1 + 2*newSLG2 + 3*newSLG3 + 4*newHR) / newAB : null;
      const sObp = (newAB + newBB + newSF) > 0
        ? (newH + newBB) / (newAB + newBB + newSF) : null;
      const sOps = sObp !== null && sSlg !== null ? sObp + sSlg : null;

      await prisma.playerSeasonStats.update({
        where: { playerId_seasonId: { playerId, seasonId } },
        data: {
          gamesPlayed:      { increment: 1 },
          atBats:           { increment: ab },
          plateAppearances: { increment: pa },
          hits:             { increment: h },
          singles:          { increment: stats.singles },
          doubles:          { increment: stats.doubles },
          triples:          { increment: stats.triples },
          homeRuns:         { increment: stats.homeRuns },
          rbi:              { increment: stats.rbi },
          runs:             { increment: stats.runs },
          walks:            { increment: stats.walks },
          strikeouts:       { increment: stats.strikeouts },
          sacFlies:         { increment: stats.sacFlies },
          reachedOnError:   { increment: stats.reachedOnError },
          battingAvg:       sAvg,
          slugging:         sSlg,
          obp:              sObp,
          ops:              sOps,
        },
      });
    } else {
      await prisma.playerSeasonStats.create({
        data: {
          playerId,
          seasonId,
          gamesPlayed:      1,
          atBats:           ab,
          plateAppearances: pa,
          hits:             h,
          singles:          stats.singles,
          doubles:          stats.doubles,
          triples:          stats.triples,
          homeRuns:         stats.homeRuns,
          rbi:              stats.rbi,
          runs:             stats.runs,
          walks:            bb,
          strikeouts:       stats.strikeouts,
          sacFlies:         sf,
          reachedOnError:   stats.reachedOnError,
          battingAvg,
          slugging,
          obp,
          ops,
        },
      });
    }
  }

  // Update team season stats
  const won  = game.teamRuns > game.opponentRuns;
  const lost = game.teamRuns < game.opponentRuns;

  await prisma.teamSeasonStats.upsert({
    where: { seasonId },
    create: {
      seasonId,
      wins:        won  ? 1 : 0,
      losses:      lost ? 1 : 0,
      runsScored:  game.teamRuns,
      runsAllowed: game.opponentRuns,
      runDiff:     game.teamRuns - game.opponentRuns,
    },
    update: {
      ...(won  && { wins:   { increment: 1 } }),
      ...(lost && { losses: { increment: 1 } }),
      runsScored:  { increment: game.teamRuns },
      runsAllowed: { increment: game.opponentRuns },
      runDiff:     { increment: game.teamRuns - game.opponentRuns },
    },
  });

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

  await prisma.playEvent.deleteMany({ where: { gameId } });
  await prisma.plateAppearance.deleteMany({ where: { gameId } });
  await prisma.playerGameStats.deleteMany({ where: { gameId } });
  await prisma.inning.deleteMany({ where: { gameId } });

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
