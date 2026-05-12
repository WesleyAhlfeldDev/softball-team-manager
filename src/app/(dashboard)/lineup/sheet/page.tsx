import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import type { FieldingPosition } from "@prisma/client";
import { PositionSheetEditor } from "@/components/lineup/PositionSheetEditor";
import type { SheetSlot } from "@/components/lineup/PositionSheetEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Position Sheet" };

interface SheetPageProps {
  searchParams: Promise<{ gameId?: string }>;
}

export default async function LineupSheetPage({ searchParams }: SheetPageProps) {
  const { gameId } = await searchParams;
  if (!gameId) redirect("/lineup");

  const session = await getSession();
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    select: { id: true, name: true, teamColor: true, defaultLineup: true },
  });
  if (!team) redirect("/lineup");

  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId: team.id },
    include: {
      lineup: {
        orderBy: { battingOrder: "asc" },
        include: {
          player: {
            select: {
              id: true, firstName: true, lastName: true,
              jerseyNumber: true, gender: true, positions: true,
            },
          },
        },
      },
    },
  });
  if (!game) redirect("/lineup");

  interface SavedSlot {
    playerId: string;
    inningPositions?: Record<number, FieldingPosition>;
  }
  let savedSlots: SavedSlot[] = [];
  if (team.defaultLineup) {
    try { savedSlots = JSON.parse(team.defaultLineup as string); } catch {}
  }

  const totalInnings = game.totalInnings ?? 7;
  const innings = Array.from({ length: totalInnings }, (_, i) => i + 1);
  const teamColor = team.teamColor ?? "#00e87a";

  const slots: SheetSlot[] = game.lineup.map((slot) => {
    const saved = savedSlots.find((s) => s.playerId === slot.playerId);
    return {
      playerId: slot.playerId,
      battingOrder: slot.battingOrder,
      fieldingPosition: slot.fieldingPosition,
      inningPositions: (saved?.inningPositions ?? {}) as Record<number, FieldingPosition>,
      player: slot.player,
    };
  });

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">{team.name} · Position Sheet</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem",
            fontWeight: 900, color: "#eeeef5", margin: "0 0 4px" }}>
            vs {game.opponent}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
            {new Date(game.gameDate).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
            {game.isHome !== null && (game.isHome ? " · Home" : " · Away")}
          </p>
        </div>
        <Link
          href={`/lineup?gameId=${gameId}`}
          style={{
            fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "none",
            background: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)",
            borderRadius: 8, padding: "8px 16px", flexShrink: 0,
          }}
        >
          ← Edit Lineup
        </Link>
      </div>

      {slots.length === 0 ? (
        <div className="card py-16 text-center">
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            No lineup has been set for this game yet.{" "}
            <Link href={`/lineup?gameId=${gameId}`} style={{ color: teamColor }}>
              Set lineup
            </Link>
          </p>
        </div>
      ) : (
        <PositionSheetEditor
          gameId={gameId}
          initialSlots={slots}
          innings={innings}
          teamColor={teamColor}
        />
      )}
    </div>
  );
}
