"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsTable, type PlayerStatRow } from "@/components/stats/StatsTable";
import { ExportStatsButton } from "@/components/stats/ExportStatsButton";
import { GenerateTestDataButton } from "@/components/stats/GenerateTestDataButton";
import { ClearStatsButton } from "@/components/stats/ClearStatsButton";

interface SeasonData {
  id: string;
  name: string;
  isActive: boolean;
  isFinished: boolean;
  teamStats: {
    wins: number; losses: number; runsScored: number; runsAllowed: number;
  } | null;
  playerStats: PlayerStatRow[];
}

interface StatsViewProps {
  seasons: SeasonData[];
  activeSeasonId: string | null;
  teamColor: string;
}

function aggregateAllSeasons(seasons: SeasonData[]): {
  teamStats: { wins: number; losses: number; runsScored: number; runsAllowed: number } | null;
  playerStats: PlayerStatRow[];
} {
  const hasTeamStats = seasons.some((s) => s.teamStats);
  const teamStats = hasTeamStats
    ? seasons.reduce(
        (acc, s) => ({
          wins:        acc.wins        + (s.teamStats?.wins        ?? 0),
          losses:      acc.losses      + (s.teamStats?.losses      ?? 0),
          runsScored:  acc.runsScored  + (s.teamStats?.runsScored  ?? 0),
          runsAllowed: acc.runsAllowed + (s.teamStats?.runsAllowed ?? 0),
        }),
        { wins: 0, losses: 0, runsScored: 0, runsAllowed: 0 }
      )
    : null;

  type Acc = {
    row: PlayerStatRow;
    ab: number; h: number; bb: number;
    singles: number; dbl: number; trp: number; hr: number;
  };
  // Key = stable player identity across seasons
  const playerMap = new Map<string, Acc>();

  for (const season of seasons) {
    for (const ps of season.playerStats) {
      const key = `${ps.player.firstName}|${ps.player.lastName}|${ps.player.jerseyNumber ?? ""}`;
      const singles = Math.max(0, ps.hits - ps.doubles - ps.triples - ps.homeRuns);

      const existing = playerMap.get(key);
      if (existing) {
        existing.ab      += ps.atBats;
        existing.h       += ps.hits;
        existing.bb      += ps.walks;
        existing.singles += singles;
        existing.dbl     += ps.doubles;
        existing.trp     += ps.triples;
        existing.hr      += ps.homeRuns;
        existing.row = {
          ...existing.row,
          gamesPlayed: existing.row.gamesPlayed + ps.gamesPlayed,
          atBats:      existing.row.atBats      + ps.atBats,
          hits:        existing.row.hits        + ps.hits,
          doubles:     existing.row.doubles     + ps.doubles,
          triples:     existing.row.triples     + ps.triples,
          homeRuns:    existing.row.homeRuns    + ps.homeRuns,
          rbi:         existing.row.rbi         + ps.rbi,
          runs:        existing.row.runs        + ps.runs,
          walks:       existing.row.walks       + ps.walks,
          strikeouts:  existing.row.strikeouts  + ps.strikeouts,
          battingAvg: null, obp: null, slugging: null, ops: null,
        };
      } else {
        playerMap.set(key, {
          row: { ...ps },
          ab: ps.atBats, h: ps.hits, bb: ps.walks,
          singles, dbl: ps.doubles, trp: ps.triples, hr: ps.homeRuns,
        });
      }
    }
  }

  const playerStats: PlayerStatRow[] = [];
  for (const { row, ab, h, bb, singles, dbl, trp, hr } of playerMap.values()) {
    const battingAvg = ab > 0 ? h / ab : null;
    const slugging   = ab > 0 ? (singles + 2 * dbl + 3 * trp + 4 * hr) / ab : null;
    const obp        = (ab + bb) > 0 ? (h + bb) / (ab + bb) : null;
    const ops        = obp !== null && slugging !== null ? obp + slugging : null;
    playerStats.push({ ...row, battingAvg, obp, slugging, ops });
  }

  playerStats.sort((a, b) => (b.battingAvg ?? -1) - (a.battingAvg ?? -1));

  return { teamStats, playerStats };
}

export function StatsView({ seasons, activeSeasonId, teamColor }: StatsViewProps) {
  const [selectedId, setSelectedId] = useState<string>(activeSeasonId ?? "all");

  const { teamStats, playerStats, seasonName } = useMemo(() => {
    if (selectedId === "all") {
      const agg = aggregateAllSeasons(seasons);
      return { ...agg, seasonName: "All Seasons" };
    }
    const season = seasons.find((s) => s.id === selectedId);
    return {
      teamStats:   season?.teamStats ?? null,
      playerStats: season?.playerStats ?? [],
      seasonName:  season?.name ?? "Season",
    };
  }, [selectedId, seasons]);

  const hasStats = playerStats.some((p) => p.gamesPlayed > 0);

  const activeSeason = seasons.find((s) => s.id === selectedId);

  const dropdown = (
    <div style={{ position: "relative" }}>
      <style>{`
        .season-select:hover { background: ${teamColor}22 !important; border-color: ${teamColor} !important; color: ${teamColor} !important; }
      `}</style>
      <select
        className="season-select"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        style={{
          appearance: "none",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          color: "#eeeef5",
          fontFamily: "var(--font-display)",
          fontSize: "0.8rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          padding: "8px 36px 8px 14px",
          cursor: "pointer",
          outline: "none",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id} style={{ background: "#0d0d1f", color: "#eeeef5" }}>
            {s.name}{s.isActive ? " (current)" : ""}
          </option>
        ))}
        <option value="all" style={{ background: "#0d0d1f", color: "#eeeef5" }}>All Seasons</option>
      </select>
      <FontAwesomeIcon
        icon={faChevronDown}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          width: 10, height: 10, color: "rgba(238,238,245,0.4)", pointerEvents: "none" }}
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={seasonName}
        title="Stats"
        subtitle={
          hasStats
            ? `${playerStats.length} players · ${teamStats?.wins ?? 0}W – ${teamStats?.losses ?? 0}L`
            : "No stats recorded yet"
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {dropdown}
            <GenerateTestDataButton />
            {hasStats && selectedId !== "all" && <ClearStatsButton />}
            {hasStats && (
              <ExportStatsButton
                seasonName={seasonName}
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
