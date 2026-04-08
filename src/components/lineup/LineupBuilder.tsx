"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faArrowUp, faArrowDown, faXmark,
  faCheck, faSpinner, faStar, faUsers,
  faTableCells, faList, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { saveDefaultLineup, applyLineupToGame } from "@/server/actions/lineup";
import type { FieldingPosition } from "@prisma/client";
import type { LeagueRules } from "@/types/league-rules";

const POSITIONS: { value: FieldingPosition; short: string; label: string }[] = [
  { value: "PITCHER",             short: "P",   label: "Pitcher"           },
  { value: "CATCHER",             short: "C",   label: "Catcher"           },
  { value: "FIRST_BASE",          short: "1B",  label: "First Base"        },
  { value: "SECOND_BASE",         short: "2B",  label: "Second Base"       },
  { value: "THIRD_BASE",          short: "3B",  label: "Third Base"        },
  { value: "SHORTSTOP",           short: "SS",  label: "Shortstop"         },
  { value: "LEFT_FIELD",          short: "LF",  label: "Left Field"        },
  { value: "LEFT_CENTER_FIELD",   short: "LCF", label: "Left Center Field" },
  { value: "CENTER_FIELD",        short: "CF",  label: "Center Field"      },
  { value: "RIGHT_CENTER_FIELD",  short: "RCF", label: "Right Center Field"},
  { value: "RIGHT_FIELD",         short: "RF",  label: "Right Field"       },
  { value: "SHORT_FIELD",         short: "SF",  label: "Short Field"       },
  { value: "EXTRA_PLAYER",        short: "EP",  label: "Extra Player"      },
  { value: "BENCH",               short: "—",   label: "Bench"             },
  { value: "SIT",                 short: "SIT", label: "Sitting Out"       },
];

const INFIELD:  FieldingPosition[] = ["PITCHER","CATCHER","FIRST_BASE","SECOND_BASE","THIRD_BASE","SHORTSTOP"];
const OUTFIELD: FieldingPosition[] = ["LEFT_FIELD","LEFT_CENTER_FIELD","CENTER_FIELD","RIGHT_CENTER_FIELD","RIGHT_FIELD","SHORT_FIELD"];
const TOTAL_INNINGS = 7;

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string | null;
  gender: string | null;
  primaryPosition: FieldingPosition;
  positions: FieldingPosition[];
}

interface LineupSlot {
  playerId: string;
  player: Player;
  battingOrder: number;
  fieldingPosition: FieldingPosition;
  inningPositions?: Record<number, FieldingPosition>;
}

interface Game { id: string; opponent: string; gameDate: Date; }

interface LineupBuilderProps {
  players: Player[];
  games: Game[];
  defaultLineup: LineupSlot[];
  leagueRules: LeagueRules;
}

type LineupMode = "standard" | "by-inning";
type WarnLevel = "error" | "warning";
interface Warning { level: WarnLevel; msg: string; }

// ── Validation engine ──────────────────────────────────────────
function validateLineup(lineup: LineupSlot[], rules: LeagueRules, inning?: number): Warning[] {
  const warnings: Warning[] = [];
  if (lineup.length === 0) return warnings;

  const getPos = (s: LineupSlot) =>
    inning !== undefined ? (s.inningPositions?.[inning] ?? s.fieldingPosition) : s.fieldingPosition;

  const activePlayers = lineup.filter((s) => getPos(s) !== "SIT" && getPos(s) !== "BENCH");

  // ── Co-ed rules ─────────────────────────────────────────────
  if (rules.isCoed) {
    // Min females on field
    const femalesOnField = activePlayers.filter(
      (s) => s.player.gender === "FEMALE"
    ).length;
    if (femalesOnField < rules.coed.minFemalesOnField) {
      warnings.push({
        level: "error",
        msg: `Need at least ${rules.coed.minFemalesOnField} female fielders — currently have ${femalesOnField}.`,
      });
    }

    // Female in infield
    if (rules.coed.requireFemaleInfield) {
      const femaleInfield = activePlayers.some(
        (s) => s.player.gender === "FEMALE" && INFIELD.includes(getPos(s))
      );
      if (!femaleInfield) {
        warnings.push({
          level: "error",
          msg: "League requires at least 1 female player in the infield.",
        });
      }
    }

    // Female in outfield
    if (rules.coed.requireFemaleOutfield) {
      const femaleOutfield = activePlayers.some(
        (s) => s.player.gender === "FEMALE" && OUTFIELD.includes(getPos(s))
      );
      if (!femaleOutfield) {
        warnings.push({
          level: "error",
          msg: "League requires at least 1 female player in the outfield.",
        });
      }
    }

    // Max consecutive male batters — only check batting order (not per-inning)
    if (inning === undefined) {
      const max = rules.coed.maxConsecutiveMaleBatters;
      let streak = 0;
      let maxStreak = 0;
      let streakStart = -1;
      let worstStart = -1;

      lineup.forEach((s, i) => {
        if (s.player.gender === "MALE") {
          if (streak === 0) streakStart = i + 1;
          streak++;
          if (streak > maxStreak) { maxStreak = streak; worstStart = streakStart; }
        } else {
          streak = 0;
        }
      });

      if (maxStreak > max) {
        warnings.push({
          level: "error",
          msg: `${maxStreak} consecutive male batters starting at spot #${worstStart} — league max is ${max}.`,
        });
      }
    }
  }

  // ── Duplicate fielding positions ────────────────────────────
  const counts: Record<string, number> = {};
  activePlayers.forEach((s) => {
    const p = getPos(s);
    if (p !== "BENCH" && p !== "SIT") counts[p] = (counts[p] ?? 0) + 1;
  });
  const dupes = Object.entries(counts)
    .filter(([, c]) => c > 1)
    .map(([pos]) => POSITIONS.find((p) => p.value === pos)?.short ?? pos);
  if (dupes.length > 0) {
    warnings.push({
      level: "warning",
      msg: `Duplicate positions: ${dupes.join(", ")}.`,
    });
  }

  return warnings;
}

// ── Helpers ────────────────────────────────────────────────────
function getSortedPositions(player: Player) {
  const ownSet = new Set<FieldingPosition>(player.positions ?? []);
  const own  = POSITIONS.filter((p) => p.value !== "SIT" && ownSet.has(p.value));
  const rest = POSITIONS.filter((p) => p.value !== "SIT" && !ownSet.has(p.value));
  const sit  = POSITIONS.filter((p) => p.value === "SIT");
  return [
    ...own.map((p)  => ({ ...p, isOwn: true  })),
    ...rest.map((p) => ({ ...p, isOwn: false })),
    ...sit.map((p)  => ({ ...p, isOwn: false })),
  ];
}

// ── Warning banner component ───────────────────────────────────
function WarningBanner({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) return null;
  const errors   = warnings.filter((w) => w.level === "error");
  const warnsOnly = warnings.filter((w) => w.level === "warning");
  return (
    <div className="mb-4 space-y-2">
      {errors.map((w, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg px-4 py-2.5"
          style={{ background: "rgba(255,61,61,0.1)", border: "1px solid rgba(255,61,61,0.3)" }}>
          <FontAwesomeIcon icon={faTriangleExclamation}
            style={{ width: 14, height: 14, color: "#ff3d3d", flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: "0.8rem", color: "#ff3d3d", fontFamily: "var(--font-body)", fontWeight: 600 }}>
            {w.msg}
          </span>
        </div>
      ))}
      {warnsOnly.map((w, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg px-4 py-2.5"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <FontAwesomeIcon icon={faTriangleExclamation}
            style={{ width: 14, height: 14, color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: "0.8rem", color: "#f59e0b", fontFamily: "var(--font-body)", fontWeight: 600 }}>
            {w.msg}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Inning grid ────────────────────────────────────────────────
function InningGrid({
  lineup, inning, onUpdate, leagueRules,
}: {
  lineup: LineupSlot[];
  inning: number;
  onUpdate: (playerId: string, inning: number, pos: FieldingPosition) => void;
  leagueRules: LeagueRules;
}) {
  const counts: Record<string, number> = {};
  lineup.forEach((s) => {
    const pos = s.inningPositions?.[inning] ?? s.fieldingPosition;
    if (pos !== "BENCH" && pos !== "SIT") counts[pos] = (counts[pos] ?? 0) + 1;
  });

  const warnings = validateLineup(lineup, leagueRules, inning);

  if (lineup.length === 0) {
    return (
      <div className="card py-12 text-center">
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
          Add players to the batting order first.
        </p>
      </div>
    );
  }

  return (
    <>
      <WarningBanner warnings={warnings} />
      <div className="card p-2">
        {lineup.map((slot, index) => {
          const currentPos = slot.inningPositions?.[inning] ?? slot.fieldingPosition;
          const isDupe = (counts[currentPos] ?? 0) > 1 && currentPos !== "BENCH" && currentPos !== "SIT";
          const isSitting = currentPos === "SIT";
          return (
            <div key={slot.playerId} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{
                background: isSitting ? "rgba(255,255,255,0.01)" : isDupe ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSitting ? "transparent" : isDupe ? "rgba(245,158,11,0.2)" : "transparent"}`,
                opacity: isSitting ? 0.45 : 1,
              }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.1rem",
                color: "var(--color-text-brand)", width: 24, textAlign: "center", flexShrink: 0 }}>
                {index + 1}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                color: "var(--color-text-muted)", width: 28, flexShrink: 0 }}>
                #{slot.player.jerseyNumber ?? "—"}
              </span>
              <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600,
                color: isSitting ? "var(--color-text-muted)" : "#eeeef5", fontFamily: "var(--font-body)" }}>
                {slot.player.firstName} {slot.player.lastName}
                {slot.player.gender === "FEMALE" && (
                  <span style={{ fontSize: "0.65rem", marginLeft: 6, color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)", verticalAlign: "middle" }}>F</span>
                )}
              </span>
              <select value={currentPos}
                onChange={(e) => onUpdate(slot.playerId, inning, e.target.value as FieldingPosition)}
                style={{
                  background: currentPos === "SIT" ? "rgba(255,255,255,0.04)" : isDupe ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${currentPos === "SIT" ? "rgba(255,255,255,0.08)" : isDupe ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.12)"}`,
                  color: currentPos === "SIT" ? "rgba(238,238,245,0.3)" : isDupe ? "#f59e0b" : "#eeeef5",
                  borderRadius: 6, padding: "4px 6px", fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", width: 60,
                }}>
                {getSortedPositions(slot.player).map((p, i, arr) => {
                  const showDivider = !p.isOwn && i > 0 && arr[i - 1]?.isOwn;
                  return (
                    <option key={p.value} value={p.value}
                      style={{ background: "#111125", color: p.isOwn ? "#eeeef5" : "rgba(238,238,245,0.45)" }}>
                      {showDivider ? "── " : ""}{p.short}{p.value === "SIT" ? " (sit out)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────
export function LineupBuilder({ players, games, defaultLineup, leagueRules }: LineupBuilderProps) {
  const [lineup, setLineup]             = useState<LineupSlot[]>(defaultLineup);
  const [mode, setMode]                 = useState<LineupMode>("standard");
  const [activeInning, setActiveInning] = useState(1);
  const [saving, setSaving]             = useState(false);
  const [applying, setApplying]         = useState(false);
  const [savedMsg, setSavedMsg]         = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string>("");

  const inLineup = new Set(lineup.map((s) => s.playerId));
  const bench    = players.filter((p) => !inLineup.has(p.id));

  const addToLineup = (player: Player) => {
    setLineup((prev) => [...prev, {
      playerId: player.id, player,
      battingOrder: prev.length + 1,
      fieldingPosition: player.primaryPosition,
      inningPositions: {},
    }]);
  };

  const removeFromLineup = (playerId: string) => {
    setLineup((prev) =>
      prev.filter((s) => s.playerId !== playerId)
        .map((s, i) => ({ ...s, battingOrder: i + 1 }))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setLineup((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
      return next.map((s, i) => ({ ...s, battingOrder: i + 1 }));
    });
  };

  const moveDown = (index: number) => {
    if (index === lineup.length - 1) return;
    setLineup((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
      return next.map((s, i) => ({ ...s, battingOrder: i + 1 }));
    });
  };

  const updatePosition = (playerId: string, pos: FieldingPosition) => {
    setLineup((prev) => prev.map((s) => s.playerId === playerId ? { ...s, fieldingPosition: pos } : s));
  };

  const updateInningPosition = (playerId: string, inning: number, pos: FieldingPosition) => {
    setLineup((prev) => prev.map((s) =>
      s.playerId === playerId
        ? { ...s, inningPositions: { ...(s.inningPositions ?? {}), [inning]: pos } }
        : s
    ));
  };

  const copyInningForward = (fromInning: number) => {
    setLineup((prev) => prev.map((s) => {
      const sourcePos = s.inningPositions?.[fromInning] ?? s.fieldingPosition;
      const updated = { ...(s.inningPositions ?? {}) };
      for (let i = fromInning + 1; i <= TOTAL_INNINGS; i++) updated[i] = sourcePos;
      return { ...s, inningPositions: updated };
    }));
  };

  const handleSaveDefault = async () => {
    setSaving(true);
    await saveDefaultLineup(lineup.map((s) => ({
      playerId: s.playerId, battingOrder: s.battingOrder,
      fieldingPosition: s.fieldingPosition,
      ...(s.inningPositions !== undefined && { inningPositions: s.inningPositions }),
    })));
    setSaving(false);
    setSavedMsg("Default lineup saved!");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const handleApplyToGame = async () => {
    if (!selectedGameId) return;
    setApplying(true);
    await applyLineupToGame(selectedGameId, lineup.map((s) => ({
      playerId: s.playerId, battingOrder: s.battingOrder,
      fieldingPosition: s.fieldingPosition,
      ...(s.inningPositions !== undefined && { inningPositions: s.inningPositions }),
    })));
    setApplying(false);
    setSavedMsg("Lineup applied to game!");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  // Standard mode warnings
  const standardWarnings = validateLineup(lineup, leagueRules);

  // Duplicate check for standard mode
  const positionCounts: Record<string, number> = {};
  lineup.forEach((s) => {
    if (s.fieldingPosition !== "BENCH" && s.fieldingPosition !== "SIT")
      positionCounts[s.fieldingPosition] = (positionCounts[s.fieldingPosition] ?? 0) + 1;
  });

  // Inning tab warning indicator
  const inningHasWarning = (inn: number) =>
    leagueRules.isCoed && validateLineup(lineup, leagueRules, inn).length > 0;

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-6 flex items-center gap-3">
        <span style={{ fontSize: "0.8rem", fontWeight: 600,
          color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Position mode:
        </span>
        <div className="flex rounded-lg p-1"
          style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
          {([
            { value: "standard",  label: "Standard",  icon: faList       },
            { value: "by-inning", label: "By Inning", icon: faTableCells },
          ] as const).map((m) => (
            <button key={m.value} onClick={() => setMode(m.value)}
              className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-semibold transition-all"
              style={{
                background: mode === m.value ? "var(--color-text-brand)" : "transparent",
                color: mode === m.value ? "#000" : "var(--color-text-muted)",
                border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
              }}>
              <FontAwesomeIcon icon={m.icon} style={{ width: 12, height: 12 }} />
              {m.label}
            </button>
          ))}
        </div>
        {/* Co-ed badge */}
        {leagueRules.isCoed && (
          <span style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
            color: "#c084fc", background: "rgba(192,132,252,0.1)",
            border: "1px solid rgba(192,132,252,0.3)",
            padding: "2px 10px", borderRadius: 6,
            fontFamily: "var(--font-body)", textTransform: "uppercase",
          }}>
            Co-ed Rules Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Bench */}
        <div>
          <div className="eyebrow mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} style={{ width: 12, height: 12 }} />
            Bench · {bench.length}
          </div>
          {bench.length === 0 ? (
            <div className="card py-8 text-center">
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                All players are in the lineup!
              </p>
            </div>
          ) : (
            <div className="card p-2">
              {bench.map((player) => (
                <div key={player.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                  style={{ cursor: "pointer" }}
                  onClick={() => addToLineup(player)}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                    color: "var(--color-text-muted)", width: 28, flexShrink: 0 }}>
                    #{player.jerseyNumber ?? "—"}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500, color: "#eeeef5" }}>
                    {player.firstName} {player.lastName}
                    {player.gender === "FEMALE" && (
                      <span style={{ fontSize: "0.65rem", marginLeft: 5,
                        color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>F</span>
                    )}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700,
                    color: "var(--color-text-muted)", background: "rgba(255,255,255,0.06)",
                    padding: "2px 8px", borderRadius: 4 }}>
                    {POSITIONS.find((p) => p.value === player.primaryPosition)?.short ?? "—"}
                  </span>
                  <FontAwesomeIcon icon={faPlus}
                    style={{ width: 12, height: 12, color: "var(--color-text-brand)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">

          {/* Standard mode */}
          {mode === "standard" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="eyebrow">Batting Order · {lineup.length}</div>
              </div>

              {/* Standard warnings */}
              <WarningBanner warnings={standardWarnings} />

              {lineup.length === 0 ? (
                <div className="card py-12 text-center">
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                    Click players on the bench to add them.
                  </p>
                </div>
              ) : (
                <div className="card p-2">
                  {lineup.map((slot, index) => {
                    const isDupe = (positionCounts[slot.fieldingPosition] ?? 0) > 1
                      && slot.fieldingPosition !== "BENCH" && slot.fieldingPosition !== "SIT";
                    const isSitting = slot.fieldingPosition === "SIT";

                    // Per-row batting order warning (consecutive males)
                    const prevGender = index > 0 ? lineup[index - 1]?.player.gender : null;
                    const nextGender = index < lineup.length - 1 ? lineup[index + 1]?.player.gender : null;
                    const inStreak = leagueRules.isCoed &&
                      slot.player.gender === "MALE" &&
                      (prevGender === "MALE" || nextGender === "MALE");

                    return (
                      <div key={slot.playerId} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2"
                        style={{
                          background: isSitting ? "rgba(255,255,255,0.01)" : isDupe ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isDupe ? "rgba(245,158,11,0.2)" : "transparent"}`,
                          opacity: isSitting ? 0.45 : 1,
                        }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                          fontSize: "1.25rem", color: "var(--color-text-brand)",
                          width: 28, textAlign: "center", flexShrink: 0 }}>
                          {index + 1}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                          color: "var(--color-text-muted)", width: 28, flexShrink: 0 }}>
                          #{slot.player.jerseyNumber ?? "—"}
                        </span>
                        <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600,
                          color: isSitting ? "var(--color-text-muted)" : "#eeeef5",
                          fontFamily: "var(--font-body)" }}>
                          {slot.player.firstName} {slot.player.lastName}
                          {slot.player.gender === "FEMALE" && (
                            <span style={{ fontSize: "0.65rem", marginLeft: 6,
                              color: "var(--color-text-muted)", fontFamily: "var(--font-mono)",
                              verticalAlign: "middle" }}>F</span>
                          )}
                        </span>
                        <select value={slot.fieldingPosition}
                          onChange={(e) => updatePosition(slot.playerId, e.target.value as FieldingPosition)}
                          style={{
                            background: isDupe ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${isDupe ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.12)"}`,
                            color: isDupe ? "#f59e0b" : isSitting ? "rgba(238,238,245,0.3)" : "#eeeef5",
                            borderRadius: 6, padding: "3px 6px", fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", width: 60,
                          }}>
                          {getSortedPositions(slot.player).map((p, i, arr) => {
                            const showDivider = !p.isOwn && i > 0 && arr[i - 1]?.isOwn;
                            return (
                              <option key={p.value} value={p.value}
                                style={{ background: "#111125", color: p.isOwn ? "#eeeef5" : "rgba(238,238,245,0.45)" }}>
                                {showDivider ? "── " : ""}{p.short}{p.value === "SIT" ? " (sit out)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        <div className="flex gap-1">
                          <button onClick={() => moveUp(index)} disabled={index === 0}
                            style={{ background: "none", border: "none",
                              cursor: index === 0 ? "default" : "pointer",
                              color: index === 0 ? "rgba(255,255,255,0.15)" : "rgba(238,238,245,0.5)",
                              padding: "4px 6px", borderRadius: 6 }}>
                            <FontAwesomeIcon icon={faArrowUp} style={{ width: 12, height: 12 }} />
                          </button>
                          <button onClick={() => moveDown(index)} disabled={index === lineup.length - 1}
                            style={{ background: "none", border: "none",
                              cursor: index === lineup.length - 1 ? "default" : "pointer",
                              color: index === lineup.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(238,238,245,0.5)",
                              padding: "4px 6px", borderRadius: 6 }}>
                            <FontAwesomeIcon icon={faArrowDown} style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                        <button onClick={() => removeFromLineup(slot.playerId)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "rgba(238,238,245,0.3)", padding: "4px 6px", borderRadius: 6 }}>
                          <FontAwesomeIcon icon={faXmark} style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* By-inning mode */}
          {mode === "by-inning" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="eyebrow">Positions by Inning</div>
                {lineup.length > 0 && activeInning < TOTAL_INNINGS && (
                  <button onClick={() => copyInningForward(activeInning)}
                    style={{ background: "rgba(255,255,255,0.06)", color: "#eeeef5",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                      padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600,
                      cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    Copy inning {activeInning} → remaining
                  </button>
                )}
              </div>

              {/* Inning tabs */}
              <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
                {Array.from({ length: TOTAL_INNINGS }, (_, i) => i + 1).map((inn) => {
                  const hasPositions = lineup.some((s) => s.inningPositions?.[inn]);
                  const hasWarning   = hasPositions && inningHasWarning(inn);
                  return (
                    <button key={inn} onClick={() => setActiveInning(inn)}
                      style={{
                        position: "relative",
                        padding: "6px 14px", borderRadius: 8, border: "none",
                        background: activeInning === inn
                          ? "var(--color-text-brand)"
                          : hasWarning ? "rgba(255,61,61,0.1)"
                          : hasPositions ? "rgba(0,232,122,0.1)"
                          : "rgba(255,255,255,0.06)",
                        color: activeInning === inn ? "#000"
                          : hasWarning ? "#ff3d3d"
                          : hasPositions ? "#00e87a"
                          : "#eeeef5",
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "0.875rem", cursor: "pointer", minWidth: 44, flexShrink: 0,
                        borderBottom: activeInning === inn ? "none"
                          : hasWarning ? "2px solid rgba(255,61,61,0.4)"
                          : hasPositions ? "2px solid rgba(0,232,122,0.3)"
                          : "2px solid transparent",
                      }}>
                      {inn}
                    </button>
                  );
                })}
              </div>

              <InningGrid
                lineup={lineup}
                inning={activeInning}
                onUpdate={updateInningPosition}
                leagueRules={leagueRules}
              />

              {/* Batting order collapsed */}
              <details className="mt-4">
                <summary style={{ cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                  color: "var(--color-text-muted)", fontFamily: "var(--font-body)",
                  listStyle: "none", padding: "8px 0" }}>
                  ▸ Edit batting order ({lineup.length} players)
                </summary>
                {/* Batting order warnings always apply */}
                {leagueRules.isCoed && (
                  <div className="mt-2">
                    <WarningBanner warnings={validateLineup(lineup, leagueRules).filter(
                      (w) => w.msg.includes("consecutive")
                    )} />
                  </div>
                )}
                <div className="card mt-2 p-2">
                  {lineup.map((slot, index) => (
                    <div key={slot.playerId} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                        fontSize: "1.1rem", color: "var(--color-text-brand)", width: 24, textAlign: "center" }}>
                        {index + 1}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                        color: "var(--color-text-muted)", width: 28 }}>
                        #{slot.player.jerseyNumber ?? "—"}
                      </span>
                      <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: "#eeeef5" }}>
                        {slot.player.firstName} {slot.player.lastName}
                        {slot.player.gender === "FEMALE" && (
                          <span style={{ fontSize: "0.65rem", marginLeft: 6,
                            color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>F</span>
                        )}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => moveUp(index)} disabled={index === 0}
                          style={{ background: "none", border: "none",
                            cursor: index === 0 ? "default" : "pointer",
                            color: index === 0 ? "rgba(255,255,255,0.15)" : "rgba(238,238,245,0.5)",
                            padding: "4px 6px" }}>
                          <FontAwesomeIcon icon={faArrowUp} style={{ width: 11, height: 11 }} />
                        </button>
                        <button onClick={() => moveDown(index)} disabled={index === lineup.length - 1}
                          style={{ background: "none", border: "none",
                            cursor: index === lineup.length - 1 ? "default" : "pointer",
                            color: index === lineup.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(238,238,245,0.5)",
                            padding: "4px 6px" }}>
                          <FontAwesomeIcon icon={faArrowDown} style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                      <button onClick={() => removeFromLineup(slot.playerId)}
                        style={{ background: "none", border: "none", cursor: "pointer",
                          color: "rgba(238,238,245,0.3)", padding: "4px 6px" }}>
                        <FontAwesomeIcon icon={faXmark} style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}

          {/* Save actions */}
          {lineup.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <button onClick={handleSaveDefault} disabled={saving}
                  className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "var(--color-text-brand)", color: "#000",
                    fontFamily: "var(--font-display)", fontSize: "0.9rem",
                    letterSpacing: "0.05em", border: "none", cursor: "pointer" }}>
                  {saving
                    ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 14, height: 14 }} />
                    : <FontAwesomeIcon icon={faStar} style={{ width: 14, height: 14 }} />
                  }
                  SAVE AS DEFAULT
                </button>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Auto-loads for new games
                </span>
              </div>

              {games.length > 0 && (
                <div className="rounded-[14px] p-4"
                  style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
                  <div className="field-label mb-2">Apply to a specific game</div>
                  <div className="flex gap-3">
                    <select value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)}
                      className="input"
                      style={{ flex: 1, background: "var(--color-surface-card2)",
                        color: selectedGameId ? "#eeeef5" : "rgba(238,238,245,0.4)", cursor: "pointer" }}>
                      <option value="" style={{ background: "#111125", color: "rgba(238,238,245,0.4)" }}>
                        Select a game…
                      </option>
                      {games.map((g) => (
                        <option key={g.id} value={g.id} style={{ background: "#111125", color: "#eeeef5" }}>
                          vs {g.opponent} — {new Date(g.gameDate).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </option>
                      ))}
                    </select>
                    <button onClick={handleApplyToGame} disabled={applying || !selectedGameId}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#eeeef5",
                        fontFamily: "var(--font-display)", fontSize: "0.875rem",
                        letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0.12)",
                        cursor: "pointer", whiteSpace: "nowrap" }}>
                      {applying
                        ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 13, height: 13 }} />
                        : <FontAwesomeIcon icon={faCheck} style={{ width: 13, height: 13 }} />
                      }
                      APPLY
                    </button>
                  </div>
                </div>
              )}

              {savedMsg && (
                <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
                  style={{ background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.3)",
                    color: "#00e87a" }}>
                  <FontAwesomeIcon icon={faCheck} style={{ width: 13, height: 13 }} />
                  {savedMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
