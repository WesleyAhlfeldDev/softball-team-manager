import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import type { FieldingPosition } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Position Sheet" };

interface SheetPageProps {
  searchParams: Promise<{ gameId?: string }>;
}

const POS_SHORT: Record<FieldingPosition, string> = {
  PITCHER:            "P",
  CATCHER:            "C",
  FIRST_BASE:         "1B",
  SECOND_BASE:        "2B",
  THIRD_BASE:         "3B",
  SHORTSTOP:          "SS",
  LEFT_FIELD:         "LF",
  LEFT_CENTER_FIELD:  "LCF",
  CENTER_FIELD:       "CF",
  RIGHT_CENTER_FIELD: "RCF",
  RIGHT_FIELD:        "RF",
  SHORT_FIELD:        "SF",
  EXTRA_PLAYER:       "EP",
  BENCH:              "—",
  SIT:                "SIT",
};

const INFIELD:  FieldingPosition[] = ["PITCHER","CATCHER","FIRST_BASE","SECOND_BASE","THIRD_BASE","SHORTSTOP"];
const OUTFIELD: FieldingPosition[] = ["LEFT_FIELD","LEFT_CENTER_FIELD","CENTER_FIELD","RIGHT_CENTER_FIELD","RIGHT_FIELD","SHORT_FIELD"];

function posColor(pos: FieldingPosition) {
  if (pos === "BENCH" || pos === "SIT") return null;
  if (INFIELD.includes(pos))  return "#5b8fff";
  if (OUTFIELD.includes(pos)) return "#00e87a";
  return "#c084fc"; // EP
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
            select: { id: true, firstName: true, lastName: true, jerseyNumber: true, gender: true },
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

  const lineup = game.lineup.map((slot) => {
    const saved = savedSlots.find((s) => s.playerId === slot.playerId);
    return { ...slot, inningPositions: (saved?.inningPositions ?? {}) as Record<number, FieldingPosition> };
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

      {lineup.length === 0 ? (
        <div className="card py-16 text-center">
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            No lineup has been set for this game yet.{" "}
            <Link href={`/lineup?gameId=${gameId}`} style={{ color: teamColor }}>Set lineup</Link>
          </p>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border-subtle)", background: "rgba(255,255,255,0.02)" }}>
                  <th style={TH}>#</th>
                  <th style={{ ...TH, textAlign: "left", minWidth: 150 }}>Player</th>
                  {innings.map((inn) => (
                    <th key={inn} style={{ ...TH, minWidth: 54 }}>Inn {inn}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineup.map((slot, index) => (
                  <tr key={slot.playerId}
                    style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>

                    {/* Batting order */}
                    <td style={{ padding: "10px 12px", textAlign: "center",
                      fontFamily: "var(--font-display)", fontWeight: 900,
                      fontSize: "1.1rem", color: teamColor, width: 40 }}>
                      {index + 1}
                    </td>

                    {/* Player name */}
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#eeeef5" }}>
                        {slot.player.firstName} {slot.player.lastName}
                      </span>
                      {slot.player.jerseyNumber && (
                        <span style={{ marginLeft: 7, fontSize: "0.7rem",
                          color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                          #{slot.player.jerseyNumber}
                        </span>
                      )}
                      {slot.player.gender === "FEMALE" && (
                        <span style={{ marginLeft: 5, fontSize: "0.65rem",
                          color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                          F
                        </span>
                      )}
                    </td>

                    {/* One cell per inning */}
                    {innings.map((inn) => {
                      const pos: FieldingPosition =
                        slot.inningPositions[inn] ?? slot.fieldingPosition;
                      const color = posColor(pos);
                      return (
                        <td key={inn} style={{ padding: "8px 6px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.75rem",
                            color:      color ?? "rgba(238,238,245,0.25)",
                            background: color ? `${color}18` : "transparent",
                            border:     color ? `1px solid ${color}33` : "none",
                            borderRadius: 6, padding: "3px 7px", minWidth: 38,
                          }}>
                            {POS_SHORT[pos]}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-5">
            {[
              { label: "Infield",  color: "#5b8fff" },
              { label: "Outfield", color: "#00e87a" },
              { label: "Extra Player", color: "#c084fc" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {item.label}
                </span>
              </div>
            ))}
            <span style={{ fontSize: "0.75rem", color: "rgba(238,238,245,0.2)", marginLeft: "auto" }}>
              Inning positions from default lineup · Override per-inning in the lineup editor
            </span>
          </div>
        </>
      )}
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(238,238,245,0.4)",
  textAlign: "center",
};
