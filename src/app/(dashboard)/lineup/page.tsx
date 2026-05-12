import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { LineupBuilder } from "@/components/lineup/LineupBuilder";
import { DEFAULT_LEAGUE_RULES, type LeagueRules } from "@/types/league-rules";
import type { FieldingPosition } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lineup" };

interface LineupPageProps {
  searchParams: Promise<{ gameId?: string }>;
}

export default async function LineupPage({ searchParams }: LineupPageProps) {
  const { gameId } = await searchParams;
  const session = await getSession();
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    include: {
      players: {
        where: { isActive: true },
        orderBy: { jerseyNumber: "asc" },
      },
    },
  });

  if (!team) redirect("/login");

  const games = await prisma.game.findMany({
    where: { teamId: team.id },
    orderBy: { gameDate: "asc" },
    select: { id: true, opponent: true, gameDate: true, status: true },
  });

  let leagueRules: LeagueRules = DEFAULT_LEAGUE_RULES;
  if (team.leagueRules) {
    try { leagueRules = JSON.parse(team.leagueRules as string) as LeagueRules; }
    catch { leagueRules = DEFAULT_LEAGUE_RULES; }
  }

  interface SavedSlot {
    playerId: string;
    battingOrder: number;
    fieldingPosition: FieldingPosition;
    inningPositions?: Record<number, FieldingPosition>;
  }

  type SlimPlayer = {
    id: string;
    firstName: string;
    lastName: string;
    jerseyNumber: string | null;
    gender: string | null;
    primaryPosition: FieldingPosition;
    positions: FieldingPosition[];
  };

  type LineupSlotInit = {
    playerId: string;
    player: SlimPlayer;
    battingOrder: number;
    fieldingPosition: FieldingPosition;
    inningPositions?: Record<number, FieldingPosition>;
  };

  // Parse saved default lineup slots (used as fallback and for inningPositions)
  let savedSlots: SavedSlot[] = [];
  if (team.defaultLineup) {
    try { savedSlots = JSON.parse(team.defaultLineup as string); } catch {}
  }

  let initialLineup: LineupSlotInit[] = [];

  if (gameId) {
    // Load the specific game's saved lineup from DB
    const game = await prisma.game.findFirst({
      where: { id: gameId, teamId: team.id },
      include: {
        lineup: {
          orderBy: { battingOrder: "asc" },
          include: {
            player: {
              select: { id: true, firstName: true, lastName: true, jerseyNumber: true, gender: true, primaryPosition: true, positions: true },
            },
          },
        },
      },
    });

    if (game && game.lineup.length > 0) {
      initialLineup = game.lineup.map((slot) => {
        const saved = savedSlots.find((s) => s.playerId === slot.playerId);
        return {
          playerId: slot.playerId,
          player: slot.player,
          battingOrder: slot.battingOrder,
          fieldingPosition: slot.fieldingPosition,
          inningPositions: saved?.inningPositions ?? {},
        };
      });
    } else {
      // Game exists but no lineup yet — load default as starting point
      initialLineup = savedSlots
        .map((s) => {
          const player = team.players.find((p) => p.id === s.playerId);
          if (!player) return null;
          return { playerId: s.playerId, player, battingOrder: s.battingOrder,
            fieldingPosition: s.fieldingPosition, inningPositions: s.inningPositions };
        })
        .filter(Boolean) as LineupSlotInit[];
    }
  } else {
    // No game selected — show default lineup
    initialLineup = savedSlots
      .map((s) => {
        const player = team.players.find((p) => p.id === s.playerId);
        if (!player) return null;
        return { playerId: s.playerId, player, battingOrder: s.battingOrder,
          fieldingPosition: s.fieldingPosition, inningPositions: s.inningPositions };
      })
      .filter(Boolean) as LineupSlotInit[];
  }

  return (
    <div>
      <PageHeader eyebrow="Game Day" title="Lineup"
        subtitle="Set your batting order and fielding positions" />
      <LineupBuilder
        key={gameId ?? "default"}
        players={team.players}
        games={games}
        defaultLineup={initialLineup}
        leagueRules={leagueRules}
        selectedGameId={gameId ?? null}
      />
    </div>
  );
}
