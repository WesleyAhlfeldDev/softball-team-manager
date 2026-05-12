import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { LineupBuilder } from "@/components/lineup/LineupBuilder";
import { DEFAULT_LEAGUE_RULES, type LeagueRules } from "@/types/league-rules";
import type { FieldingPosition } from "@prisma/client";

export const metadata = { title: "Lineup" };

export default async function LineupPage() {
  const session = await getSession();
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    include: {
      players: {
        where: { isActive: true },
        orderBy: { jerseyNumber: "asc" },
      },
      games: {
        where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
        orderBy: { gameDate: "asc" },
        take: 10,
      },
    },
  });

  if (!team) redirect("/login");

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

  let defaultLineup: {
    playerId: string;
    player: typeof team.players[number];
    battingOrder: number;
    fieldingPosition: FieldingPosition;
    inningPositions?: Record<number, FieldingPosition>;
  }[] = [];

  if (team.defaultLineup) {
    try {
      const saved: SavedSlot[] = JSON.parse(team.defaultLineup as string);
      defaultLineup = saved
        .map((s) => {
          const player = team.players.find((p) => p.id === s.playerId);
          if (!player) return null;
          return { playerId: s.playerId, player, battingOrder: s.battingOrder,
            fieldingPosition: s.fieldingPosition, inningPositions: s.inningPositions };
        })
        .filter(Boolean) as typeof defaultLineup;
    } catch { defaultLineup = []; }
  }

  return (
    <div>
      <PageHeader eyebrow="Game Day" title="Lineup"
        subtitle="Set your batting order and fielding positions" />
      <LineupBuilder
        players={team.players}
        games={team.games}
        defaultLineup={defaultLineup}
        leagueRules={leagueRules}
      />
    </div>
  );
}
