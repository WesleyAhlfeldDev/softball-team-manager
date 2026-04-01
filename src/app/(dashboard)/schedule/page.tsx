import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddGameForm } from "@/components/schedule/AddGameForm";
import { GameCard } from "@/components/schedule/GameCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const team = await prisma.team.findFirst({
    where: { userId: session.user.id },
    include: {
      games: { orderBy: { gameDate: "asc" } },
      teamStats: true,
    },
  });

  if (!team) redirect("/login");

  const now = new Date();
  const upcoming = team.games.filter(
    (g) => g.status === "SCHEDULED" || g.status === "IN_PROGRESS" || new Date(g.gameDate) >= now
  );
  const past = team.games.filter(
    (g) => g.status === "FINAL" || g.status === "POSTPONED" ||
      g.status === "CANCELLED" || g.status === "FORFEIT"
  ).reverse(); // Most recent first

  const wins   = past.filter((g) => g.status === "FINAL" && g.teamRuns > g.opponentRuns).length;
  const losses = past.filter((g) => g.status === "FINAL" && g.teamRuns < g.opponentRuns).length;
  const ties   = past.filter((g) => g.status === "FINAL" && g.teamRuns === g.opponentRuns).length;

  return (
    <div>
      <PageHeader
        eyebrow="Season"
        title="Schedule"
        subtitle={past.length > 0 ? `${wins}W – ${losses}L${ties > 0 ? ` – ${ties}T` : ""} · ${upcoming.length} games remaining` : `${team.games.length} games scheduled`}
        action={<AddGameForm />}
      />

      {/* Season record bar */}
      {past.length > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Wins",   value: wins,   color: "#00e87a" },
            { label: "Losses", value: losses, color: "#ff3d3d" },
            { label: "Ties",   value: ties,   color: "#f59e0b" },
            { label: "Games",  value: past.length, color: "#eeeef5" },
          ].map((s) => (
            <div key={s.label} className="card py-4 text-center">
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {team.games.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <FontAwesomeIcon icon={faCalendarDays}
            style={{ width: 32, height: 32, color: "var(--color-text-muted)" }} />
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            No games scheduled yet. Add your first game above!
          </p>
        </div>
      )}

      {/* Upcoming games */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <div className="eyebrow mb-4">Upcoming · {upcoming.length}</div>
          {upcoming.map((game) => (
            <GameCard key={game.id} game={game} teamName={team.name} />
          ))}
        </div>
      )}

      {/* Past games */}
      {past.length > 0 && (
        <div>
          <div className="eyebrow mb-4">Results · {past.length}</div>
          {past.map((game) => (
            <GameCard key={game.id} game={game} teamName={team.name} />
          ))}
        </div>
      )}
    </div>
  );
}
