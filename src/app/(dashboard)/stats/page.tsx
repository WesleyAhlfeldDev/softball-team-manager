import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import { ExportStatsButton } from "@/components/stats/ExportStatsButton";
import { GenerateTestDataButton } from "@/components/stats/GenerateTestDataButton";
import { StatsTable } from "@/components/stats/StatsTable";
import { ClearStatsButton } from "@/components/stats/ClearStatsButton";

export const metadata = { title: "Stats" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    include: {
      seasons: {
        where: { isActive: true },
        include: {
          teamStats: true,
          playerStats: {
            include: {
              player: {
                select: {
                  firstName: true, lastName: true, jerseyNumber: true, isActive: true,
                },
              },
            },
            orderBy: { battingAvg: "desc" },
          },
        },
      },
    },
  });

  if (!team) redirect("/login");

  const activeSeason  = team.seasons[0];
  const teamStats     = activeSeason?.teamStats;
  const playerStats   = activeSeason?.playerStats ?? [];
  const hasStats      = playerStats.some((p) => p.gamesPlayed > 0);

  const teamColor = team.teamColor ?? "#00e87a";

  return (
    <div>
      <PageHeader
        eyebrow={activeSeason?.name ?? "Season"}
        title="Stats"
        subtitle={
          hasStats
            ? `${playerStats.length} players · ${teamStats?.wins ?? 0}W – ${teamStats?.losses ?? 0}L`
            : "No stats recorded yet"
        }
        action={
          <div className="flex items-center gap-2">
            <GenerateTestDataButton />
            {hasStats && <ClearStatsButton />}
            {hasStats && (
              <ExportStatsButton
                seasonName={activeSeason?.name ?? "Season"}
                players={playerStats.map((ps) => ({
                  jerseyNumber: ps.player.jerseyNumber,
                  firstName:    ps.player.firstName,
                  lastName:     ps.player.lastName,
                  gamesPlayed:  ps.gamesPlayed,
                  atBats:       ps.atBats,
                  hits:         ps.hits,
                  doubles:      ps.doubles,
                  triples:      ps.triples,
                  homeRuns:     ps.homeRuns,
                  rbi:          ps.rbi,
                  runs:         ps.runs,
                  walks:        ps.walks,
                  strikeouts:   ps.strikeouts,
                  battingAvg:   ps.battingAvg,
                  obp:          ps.obp,
                  slugging:     ps.slugging,
                  ops:          ps.ops,
                }))}
              />
            )}
          </div>
        }
      />

      {/* Team summary strip */}
      {teamStats && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Wins",         value: teamStats.wins,        color: teamColor },
            { label: "Losses",       value: teamStats.losses,      color: "#ff3d3d" },
            { label: "Runs Scored",  value: teamStats.runsScored,  color: teamColor },
            { label: "Runs Allowed", value: teamStats.runsAllowed, color: "#94a3b8" },
          ].map((s) => (
            <div key={s.label} className="card py-4 text-center">
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "2.25rem",
                fontWeight: 900, color: s.color, lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--color-text-muted)", marginTop: 4,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasStats && (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <FontAwesomeIcon icon={faChartBar}
            style={{ width: 32, height: 32, color: "var(--color-text-muted)" }} />
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            Stats will appear here once you finish a game in the scorebook.
          </p>
        </div>
      )}

      {/* Player stats table */}
      {hasStats && (
        <StatsTable players={playerStats} teamColor={teamColor} />
      )}
    </div>
  );
}
