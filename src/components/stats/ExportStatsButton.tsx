"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

interface PlayerStatRow {
  jerseyNumber: string | null;
  firstName: string;
  lastName: string;
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
}

interface ExportStatsButtonProps {
  seasonName: string;
  players: PlayerStatRow[];
}

function fmt(val: number | null, decimals = 3): string {
  if (val == null) return "";
  return val.toFixed(decimals);
}

export function ExportStatsButton({ seasonName, players }: ExportStatsButtonProps) {
  const handleExport = () => {
    const headers = ["#", "Player", "G", "AB", "H", "2B", "3B", "HR", "RBI", "R", "BB", "K", "AVG", "OBP", "SLG", "OPS"];

    const rows = players.map((p) => [
      p.jerseyNumber ?? "",
      `${p.firstName} ${p.lastName}`,
      p.gamesPlayed,
      p.atBats,
      p.hits,
      p.doubles,
      p.triples,
      p.homeRuns,
      p.rbi,
      p.runs,
      p.walks,
      p.strikeouts,
      fmt(p.battingAvg),
      fmt(p.obp),
      fmt(p.slugging),
      fmt(p.ops),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${seasonName.replace(/\s+/g, "_")}_stats.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-opacity hover:opacity-80"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#eeeef5",
        fontFamily: "var(--font-display)",
        fontSize: "0.85rem",
        letterSpacing: "0.05em",
        cursor: "pointer",
      }}
    >
      <FontAwesomeIcon icon={faDownload} style={{ width: 13, height: 13 }} />
      EXPORT CSV
    </button>
  );
}
