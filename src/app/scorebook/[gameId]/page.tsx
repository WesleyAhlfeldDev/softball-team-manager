import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Scorebook } from "@/components/scorebook/Scorebook";
import type { FieldingPosition } from "@prisma/client";

interface ScoreboookPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function ScoreboookPage({ params }: ScoreboookPageProps) {
  const { gameId } = await params;
  const session = await getSession();
  
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    select: { id: true, name: true, teamColor: true, defaultLineup: true },
  });
  if (!team) redirect("/login");

  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId: team.id },
    include: {
      innings: { orderBy: { inningNumber: "asc" } },
      lineup: {
        orderBy: { battingOrder: "asc" },
        include: {
          player: {
            select: { id: true, firstName: true, lastName: true, jerseyNumber: true },
          },
        },
      },
      plateAppearances: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { player: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!game) redirect("/schedule");

  // ── Build lineup with inning positions ──────────────────────
  interface SavedSlot {
    playerId: string;
    battingOrder: number;
    fieldingPosition: FieldingPosition;
    inningPositions?: Record<number, FieldingPosition>;
  }

  type LineupSlotWithInnings = {
    id: string;
    gameId: string;
    playerId: string;
    battingOrder: number;
    fieldingPosition: FieldingPosition;
    inningPositions: Record<number, FieldingPosition>;
    player: { id: string; firstName: string; lastName: string; jerseyNumber: string | null };
  };

  let lineup: LineupSlotWithInnings[] = [];

  if (game.lineup.length > 0) {
    // Game has a saved lineup — try to enrich with inningPositions from defaultLineup
    let savedSlots: SavedSlot[] = [];
    if (team.defaultLineup) {
      try { savedSlots = JSON.parse(team.defaultLineup as string) as SavedSlot[]; } catch {}
    }

    lineup = game.lineup.map((slot) => {
      const saved = savedSlots.find((s) => s.playerId === slot.playerId);
      return {
        id: slot.id,
        gameId: slot.gameId,
        playerId: slot.playerId,
        battingOrder: slot.battingOrder,
        fieldingPosition: slot.fieldingPosition,
        inningPositions: saved?.inningPositions ?? {},
        player: slot.player,
      };
    });
  } else if (team.defaultLineup) {
    // Fall back to default lineup
    try {
      const saved: SavedSlot[] = JSON.parse(team.defaultLineup as string);
      const players = await prisma.player.findMany({
        where: { id: { in: saved.map((s) => s.playerId) }, teamId: team.id },
        select: { id: true, firstName: true, lastName: true, jerseyNumber: true },
      });

      lineup = saved
        .map((s) => {
          const player = players.find((p) => p.id === s.playerId);
          if (!player) return null;
          return {
            id: `default-${s.playerId}`,
            gameId,
            playerId: s.playerId,
            battingOrder: s.battingOrder,
            fieldingPosition: s.fieldingPosition ?? ("BENCH" as FieldingPosition),
            inningPositions: s.inningPositions ?? {},
            player,
          };
        })
        .filter(Boolean) as LineupSlotWithInnings[];
    } catch {
      lineup = [];
    }
  }

  const teamColor = team.teamColor ?? "#00e87a";

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
      <Scorebook
        game={{
          id: game.id,
          opponent: game.opponent,
          isHome: game.isHome,
          status: game.status,
          teamRuns: game.teamRuns,
          opponentRuns: game.opponentRuns,
          totalInnings: game.totalInnings,
          innings: game.innings,
          lineup,
          plateAppearances: game.plateAppearances,
        }}
        teamName={team.name}
        teamColor={teamColor}
      />
    </div>
  );
}
