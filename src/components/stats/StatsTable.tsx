"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

export interface PlayerStatRow {
  id: string;
  gamesPlayed: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  runs: number;
  walks: number;
  strikeouts: number;
  battingAvg: number | null;
  obp: number | null;
  slugging: number | null;
  ops: number | null;
  player: {
    firstName: string;
    lastName: string;
    jerseyNumber: string | null;
    isActive: boolean;
  };
}

type SortKey =
  | "jersey" | "name" | "g" | "ab" | "h" | "2b" | "3b"
  | "hr" | "rbi" | "r" | "bb" | "k" | "avg" | "obp" | "slg" | "ops";

function fmtAvg(val: number | null | undefined): string {
  if (val == null) return "—";
  return val.toFixed(3).replace(/^0/, "");
}

function fmtStat(val: number | null | undefined): string {
  if (val == null) return "—";
  return val.toString();
}

function getValue(ps: PlayerStatRow, key: SortKey): string | number | null {
  switch (key) {
    case "jersey": return ps.player.jerseyNumber ?? "";
    case "name":   return `${ps.player.lastName} ${ps.player.firstName}`.toLowerCase();
    case "g":      return ps.gamesPlayed;
    case "ab":     return ps.atBats;
    case "h":      return ps.hits;
    case "2b":     return ps.doubles;
    case "3b":     return ps.triples;
    case "hr":     return ps.homeRuns;
    case "rbi":    return ps.rbi;
    case "r":      return ps.runs;
    case "bb":     return ps.walks;
    case "k":      return ps.strikeouts;
    case "avg":    return ps.battingAvg;
    case "obp":    return ps.obp;
    case "slg":    return ps.slugging;
    case "ops":    return ps.ops;
  }
}

const COLUMNS: { label: string; key: SortKey; align: "center" | "left" }[] = [
  { label: "#",      key: "jersey", align: "center" },
  { label: "Player", key: "name",   align: "left" },
  { label: "G",      key: "g",      align: "center" },
  { label: "AB",     key: "ab",     align: "center" },
  { label: "H",      key: "h",      align: "center" },
  { label: "2B",     key: "2b",     align: "center" },
  { label: "3B",     key: "3b",     align: "center" },
  { label: "HR",     key: "hr",     align: "center" },
  { label: "RBI",    key: "rbi",    align: "center" },
  { label: "R",      key: "r",      align: "center" },
  { label: "BB",     key: "bb",     align: "center" },
  { label: "K",      key: "k",      align: "center" },
  { label: "AVG",    key: "avg",    align: "center" },
  { label: "OBP",    key: "obp",    align: "center" },
  { label: "SLG",    key: "slg",    align: "center" },
  { label: "OPS",    key: "ops",    align: "center" },
];

interface StatsTableProps {
  players: PlayerStatRow[];
  teamColor: string;
}

export function StatsTable({ players, teamColor }: StatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("avg");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    return [...players].sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      // nulls / empty always last
      if (av == null || av === "") return 1;
      if (bv == null || bv === "") return -1;
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
      } else {
        cmp = (av as number) - (bv as number);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [players, sortKey, sortDir]);

  const maxAvg = Math.max(...players.map((p) => p.battingAvg ?? -1));

  return (
    <div className="card overflow-x-auto p-0">
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
        <thead>
          <tr style={{
            borderBottom: "1px solid var(--color-border-subtle)",
            background: "rgba(255,255,255,0.02)",
          }}>
            {COLUMNS.map((col) => {
              const isActive = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: isActive ? teamColor : "rgba(238,238,245,0.4)",
                    textAlign: col.align,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "color 0.15s",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {col.label}
                    {isActive ? (
                      <FontAwesomeIcon
                        icon={sortDir === "desc" ? faCaretDown : faCaretUp}
                        style={{ width: 8, height: 8, opacity: 0.9 }}
                      />
                    ) : (
                      <span style={{ width: 8, display: "inline-block" }} />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((ps) => {
            const name = `${ps.player.firstName} ${ps.player.lastName}`;
            const isLeader = ps.battingAvg != null && ps.battingAvg === maxAvg;
            return (
              <tr
                key={ps.id}
                style={{
                  borderBottom: "1px solid var(--color-border-subtle)",
                  opacity: ps.player.isActive ? 1 : 0.5,
                }}
              >
                <td className="px-3 py-3" style={{ textAlign: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.8rem",
                  color: "var(--color-text-muted)" }}>
                  {ps.player.jerseyNumber ?? "—"}
                </td>

                <td className="px-3 py-3" style={{ whiteSpace: "nowrap" }}>
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: "0.9rem", color: "#eeeef5",
                  }}>
                    {name}
                  </span>
                </td>

                {([
                  ps.gamesPlayed, ps.atBats, ps.hits,
                  ps.doubles, ps.triples, ps.homeRuns,
                  ps.rbi, ps.runs, ps.walks, ps.strikeouts,
                ] as (number | null)[]).map((val, i) => (
                  <td key={i} className="px-3 py-3" style={{
                    textAlign: "center",
                    fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                  }}>
                    {fmtStat(val)}
                  </td>
                ))}

                <td className="px-3 py-3" style={{ textAlign: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                  fontWeight: isLeader ? 700 : 400,
                  color: isLeader ? teamColor : "var(--color-text-secondary)" }}>
                  {fmtAvg(ps.battingAvg)}
                </td>
                <td className="px-3 py-3" style={{ textAlign: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                  color: "var(--color-text-secondary)" }}>
                  {fmtAvg(ps.obp)}
                </td>
                <td className="px-3 py-3" style={{ textAlign: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                  color: "var(--color-text-secondary)" }}>
                  {fmtAvg(ps.slugging)}
                </td>
                <td className="px-3 py-3" style={{ textAlign: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                  color: "var(--color-text-secondary)" }}>
                  {ps.ops != null ? ps.ops.toFixed(3) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
