import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeagueSettings } from "@/components/dashboard/LeagueSettings";
import { TeamInfo } from "@/components/dashboard/TeamInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faCalendarDays, faListOl,
  faBolt, faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { DEFAULT_LEAGUE_RULES, type LeagueRules } from "@/types/league-rules";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    include: {
      players:   { where: { isActive: true } },
      games:     { orderBy: { gameDate: "asc" } },
      teamStats: true,
    },
  });

  if (!team) redirect("/login");

  // Parse league rules
  let leagueRules: LeagueRules = DEFAULT_LEAGUE_RULES;
  if (team.leagueRules) {
    try {
      leagueRules = JSON.parse(team.leagueRules as string) as LeagueRules;
    } catch {
      leagueRules = DEFAULT_LEAGUE_RULES;
    }
  }

  const upcomingGames = team.games.filter((g) => g.status === "SCHEDULED");
  const nextGame      = upcomingGames[0];
  const wins   = team.games.filter((g) => g.status === "FINAL" && g.teamRuns > g.opponentRuns).length;
  const losses = team.games.filter((g) => g.status === "FINAL" && g.teamRuns < g.opponentRuns).length;

  const teamColor = team.teamColor ?? "#00e87a";

  return (
    <div>
      <PageHeader
        eyebrow="Welcome back, Coach"
        title={team.name || "Dashboard"}
        subtitle={`${team.season}${team.league ? ` · ${team.league}` : ""}`}
      />

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Roster",    value: team.players.length,  unit: "players",      icon: faUsers,        href: "/roster",   color: teamColor },
          { label: "Scheduled", value: upcomingGames.length, unit: "upcoming",     icon: faCalendarDays, href: "/schedule", color: "#5b8fff" },
          { label: "Record",    value: `${wins}–${losses}`,  unit: "W–L",          icon: faTrophy,       href: "/schedule", color: teamColor },
          { label: "Lineup",    value: team.defaultLineup ? "SET" : "NONE",
            unit: team.defaultLineup ? "default saved" : "not set",
            icon: faListOl, href: "/lineup",
            color: team.defaultLineup ? teamColor : "#ff3d3d" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card flex flex-col gap-3 transition-colors hover:border-[var(--color-border-default)]"
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                {card.label}
              </span>
              <FontAwesomeIcon icon={card.icon}
                style={{ width: 14, height: 14, color: card.color }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem",
              fontWeight: 900, color: card.color, lineHeight: 1 }}>
              {card.value}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)", textTransform: "uppercase",
              letterSpacing: "0.08em" }}>
              {card.unit}
            </span>
          </Link>
        ))}
      </div>

      {/* Next game CTA */}
      {nextGame ? (
        <div className="card mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: `${teamColor}44` }}>
          <div>
            <div className="eyebrow mb-1">Next Game</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem",
              fontWeight: 800, color: "#eeeef5", margin: "0 0 4px" }}>
              vs {nextGame.opponent}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
              {new Date(nextGame.gameDate).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              })}
              {nextGame.isHome ? " · 🏠 Home" : " · ✈️ Away"}
              {nextGame.location ? ` · ${nextGame.location}` : ""}
            </p>
          </div>
          <Link href={`/scorebook/${nextGame.id}`}
            className="flex shrink-0 items-center gap-2 rounded-lg px-6 py-3 font-bold transition-opacity hover:opacity-80"
            style={{
              background: teamColor, color: "#000",
              fontFamily: "var(--font-display)", fontSize: "1rem",
              letterSpacing: "0.05em", textDecoration: "none",
            }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ width: 14, height: 14 }} />
            GO LIVE
          </Link>
        </div>
      ) : (
        <div className="card mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: `${teamColor}44` }}>
          <div>
            <div className="eyebrow mb-1">Game Day</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem",
              fontWeight: 800, color: "#eeeef5", margin: "0 0 4px" }}>
              No games scheduled
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
              Head to the Schedule tab to add your first game.
            </p>
          </div>
          <Link href="/schedule"
            className="flex shrink-0 items-center gap-2 rounded-lg px-6 py-3 font-bold transition-opacity hover:opacity-80"
            style={{
              background: teamColor, color: "#000",
              fontFamily: "var(--font-display)", fontSize: "1rem",
              letterSpacing: "0.05em", textDecoration: "none",
            }}
          >
            <FontAwesomeIcon icon={faCalendarDays} style={{ width: 14, height: 14 }} />
            ADD GAME
          </Link>
        </div>
      )}

      {/* Team Info */}
      <TeamInfo
        initialData={{
          name:      team.name,
          season:    team.season,
          league:    team.league,
          homeField: team.homeField,
          teamColor: team.teamColor,
          logoUrl:   team.logoUrl,
        }}
      />

      {/* League Rules */}
      <LeagueSettings initialRules={leagueRules} />
    </div>
  );
}
