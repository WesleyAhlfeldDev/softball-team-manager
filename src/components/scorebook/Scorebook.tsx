"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft, faForwardStep, faStop,
  faPlus, faMinus, faCheck,
  faChevronLeft, faChevronRight,
  faListOl, faScroll,
} from "@fortawesome/free-solid-svg-icons";
import {
  recordPlateAppearance,
  undoLastPlateAppearance,
  updateOpponentScore,
  nextInning,
  endGame,
  startGame,
  restartGame,
} from "@/server/actions/scorebook";
import type { FieldingPosition, PlateAppearanceResult } from "@prisma/client";

// ── Position short labels ──────────────────────────────────────
const POS_SHORT: Partial<Record<FieldingPosition, string>> = {
  PITCHER:"P", CATCHER:"C", FIRST_BASE:"1B", SECOND_BASE:"2B",
  THIRD_BASE:"3B", SHORTSTOP:"SS", LEFT_FIELD:"LF",
  LEFT_CENTER_FIELD:"LCF", CENTER_FIELD:"CF",
  RIGHT_CENTER_FIELD:"RCF", RIGHT_FIELD:"RF",
  SHORT_FIELD:"SF", EXTRA_PLAYER:"EP", BENCH:"—", SIT:"SIT",
};

// ── Result button config ───────────────────────────────────────
const HITS: { result: PlateAppearanceResult; label: string; color: string; bg: string }[] = [
  { result: "SINGLE",   label: "1B", color: "#00e87a", bg: "rgba(0,232,122,0.15)"  },
  { result: "DOUBLE",   label: "2B", color: "#00e87a", bg: "rgba(0,232,122,0.15)"  },
  { result: "TRIPLE",   label: "3B", color: "#00e87a", bg: "rgba(0,232,122,0.15)"  },
  { result: "HOME_RUN", label: "HR", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
];
const OUTS: { result: PlateAppearanceResult; label: string }[] = [
  { result: "GROUNDOUT",        label: "GO" },
  { result: "FLYOUT",           label: "FO" },
  { result: "LINEOUT",          label: "LO" },
  { result: "POPOUT",           label: "PO" },
  { result: "STRIKEOUT",        label: "K"  },
  { result: "DOUBLE_PLAY",      label: "DP" },
  { result: "FIELDERS_CHOICE",  label: "FC" },
];
const OTHER: { result: PlateAppearanceResult; label: string }[] = [
  { result: "WALK",          label: "BB"  },
  { result: "HIT_BY_PITCH",  label: "HBP" },
  { result: "SAC_FLY",       label: "SAC" },
];

const RESULT_LABELS: Record<PlateAppearanceResult, string> = {
  SINGLE:"1B", DOUBLE:"2B", TRIPLE:"3B", HOME_RUN:"HR",
  GROUNDOUT:"GO", FLYOUT:"FO", LINEOUT:"LO", POPOUT:"PO",
  STRIKEOUT:"K", WALK:"BB", HIT_BY_PITCH:"HBP",
  REACHED_ON_ERROR:"ROE", SAC_FLY:"SAC", SAC_BUNT:"SB",
  FIELDERS_CHOICE:"FC", DOUBLE_PLAY:"DP", TRIPLE_PLAY:"TP",
};

// ── Types ──────────────────────────────────────────────────────
interface SlimPlayer {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string | null;
}
type Base = "first" | "second" | "third";
type RunnerOutcome = "out" | "first" | "second" | "third" | "scored";
interface Runners { first: SlimPlayer | null; second: SlimPlayer | null; third: SlimPlayer | null; }
interface RunnerDecision { player: SlimPlayer; from: Base; to: RunnerOutcome | null; }
interface LineupSlot {
  playerId: string;
  battingOrder: number;
  fieldingPosition: FieldingPosition;
  inningPositions: Record<number, FieldingPosition>;
  player: SlimPlayer;
}
interface Inning {
  inningNumber: number;
  teamRuns: number;
  opponentRuns: number;
  teamHits: number;
  isComplete: boolean;
}
interface PlateAppearanceRecord {
  id: string;
  playerId: string;
  inningNumber: number;
  result: PlateAppearanceResult;
  rbis: number;
  runsScored: boolean;
  player: { firstName: string; lastName: string };
}
interface GameData {
  id: string;
  opponent: string;
  isHome: boolean | null;
  status: string;
  teamRuns: number;
  opponentRuns: number;
  totalInnings: number;
  innings: Inning[];
  lineup: LineupSlot[];
  plateAppearances: PlateAppearanceRecord[];
}
interface ScoreboookProps { game: GameData; teamName: string; teamColor: string; }
type Step = "result" | "runners" | "error_base" | "confirm";
type RightTab = "lineup" | "log";

// ── Helpers ────────────────────────────────────────────────────
function isHitResult(r: PlateAppearanceResult) {
  return ["SINGLE","DOUBLE","TRIPLE","HOME_RUN"].includes(r);
}
function isOutResult(r: PlateAppearanceResult) {
  return ["GROUNDOUT","FLYOUT","LINEOUT","POPOUT","STRIKEOUT","DOUBLE_PLAY","TRIPLE_PLAY","FIELDERS_CHOICE"].includes(r);
}
function outsRecorded(r: PlateAppearanceResult): number {
  if (r === "DOUBLE_PLAY") return 2;
  if (r === "TRIPLE_PLAY") return 3;
  // FC and ROE when batter is out = 1 out (handled via batterFinalBase === null)
  if (["GROUNDOUT","FLYOUT","LINEOUT","POPOUT","STRIKEOUT","FIELDERS_CHOICE"].includes(r)) return 1;
  return 0;
}
function batterReachesBase(r: PlateAppearanceResult): Base | null {
  // ROE handled separately via batterFinalBase picker
  if (["SINGLE","WALK","HIT_BY_PITCH","FIELDERS_CHOICE"].includes(r)) return "first";
  if (r === "DOUBLE") return "second";
  if (r === "TRIPLE") return "third";
  return null;
}
function suggestRunnerDestination(from: Base, result: PlateAppearanceResult): RunnerOutcome {
  if (result === "HOME_RUN" || result === "TRIPLE") return "scored";
  if (result === "DOUBLE") {
    if (from === "third" || from === "second") return "scored";
    return "third";
  }
  if (result === "SINGLE") {
    if (from === "third") return "scored";
    if (from === "second") return "third";
    return "second";
  }
  if (result === "WALK" || result === "HIT_BY_PITCH") {
    if (from === "first") return "second";
    if (from === "second") return "third";
    return "third";
  }
  if (result === "FIELDERS_CHOICE") {
    if (from === "first") return "out";
    return from as RunnerOutcome;
  }
  return from as RunnerOutcome;
}
function applyRunnerDecisions(
  decisions: RunnerDecision[], batterBase: Base | null,
  batter: SlimPlayer, result: PlateAppearanceResult
): { newRunners: Runners; scored: SlimPlayer[] } {
  const newRunners: Runners = { first: null, second: null, third: null };
  const scored: SlimPlayer[] = [];
  for (const d of decisions) {
    if (!d.to || d.to === "out") continue;
    if (d.to === "scored") scored.push(d.player);
    else newRunners[d.to] = d.player;
  }
  if (result === "HOME_RUN") { scored.push(batter); }
  else if (batterBase && !newRunners[batterBase]) { newRunners[batterBase] = batter; }
  return { newRunners, scored };
}

// ── Runner Advancement UI ──────────────────────────────────────
function RunnerAdvancement({
  decisions, onChange, result, teamColor,
}: {
  decisions: RunnerDecision[];
  onChange: (d: RunnerDecision[]) => void;
  result: PlateAppearanceResult;
  teamColor: string;
}) {
  if (decisions.length === 0) return null;
  const isFC = result === "FIELDERS_CHOICE";
  const setDecision = (from: Base, to: RunnerOutcome) =>
    onChange(decisions.map((d) => d.from === from ? { ...d, to } : d));
  const baseLabel: Record<Base, string> = { first: "1st", second: "2nd", third: "3rd" };
  const destinations = (from: Base): { label: string; to: RunnerOutcome; color: string }[] => {
    const opts: { label: string; to: RunnerOutcome; color: string }[] = [
      { label: "Out",    to: "out",  color: "#ff3d3d" },
      { label: "Stayed", to: from,  color: "rgba(238,238,245,0.4)" },
    ];
    if (from === "first" || from === "second") {
      opts.push({ label: from === "first" ? "→ 2nd" : "→ 3rd",
        to: from === "first" ? "second" : "third", color: teamColor });
    }
    if (from === "first") opts.push({ label: "→ 3rd", to: "third", color: teamColor });
    opts.push({ label: "Scored", to: "scored", color: "#fbbf24" });
    return opts;
  };
  return (
    <div>
      {isFC && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 14,
          fontSize: "0.78rem", color: "rgba(238,238,245,0.6)", fontFamily: "var(--font-body)" }}>
          <strong style={{ color: "#eeeef5" }}>Fielder's Choice</strong> — batter is safe at 1st. Mark which runner was put out.
        </div>
      )}
      {decisions.map((d) => (
        <div key={d.from} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center",
              justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "0.75rem", color: "rgba(238,238,245,0.5)" }}>
              {baseLabel[d.from]}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", color: "#eeeef5" }}>
                {d.player.firstName} {d.player.lastName}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "rgba(238,238,245,0.35)" }}>
                #{d.player.jerseyNumber ?? "—"} · on {baseLabel[d.from]}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {destinations(d.from).map((opt) => {
              const active = d.to === opt.to;
              return (
                <button key={opt.to} onClick={() => setDecision(d.from, opt.to)}
                  style={{
                    padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: active ? opt.color : "rgba(255,255,255,0.06)",
                    color: active ? (opt.color === "#fbbf24" || opt.color === teamColor ? "#000" : "#fff") : "rgba(238,238,245,0.6)",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.85rem",
                    outline: active ? `2px solid ${opt.color}` : "none",
                    outlineOffset: 2, transition: "all 0.1s",
                  }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lineup Panel ───────────────────────────────────────────────
function LineupPanel({
  lineup, currentBatterIndex, currentInning, teamColor, runners,
}: {
  lineup: LineupSlot[];
  currentBatterIndex: number;
  currentInning: number;
  teamColor: string;
  runners: Runners;
}) {
  const activeBatterIdx = currentBatterIndex % lineup.length;
  // Which players are on base
  const onBaseIds = new Set(
    [runners.first, runners.second, runners.third]
      .filter(Boolean).map((p) => p!.id)
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "12px 0" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
        color: "rgba(238,238,245,0.3)", padding: "0 12px 8px",
        fontFamily: "var(--font-display)" }}>
        BATTING ORDER · INN {currentInning}
      </div>
      {lineup.map((slot, i) => {
        const isActive = i === activeBatterIdx;
        const pos = slot.inningPositions?.[currentInning] ?? slot.fieldingPosition;
        const posLabel = POS_SHORT[pos] ?? "—";
        const isSitting = pos === "SIT";
        const isOnBase = onBaseIds.has(slot.playerId);

        return (
          <div key={slot.playerId}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 12px",
              background: isActive ? `${teamColor}18` : "transparent",
              borderLeft: `3px solid ${isActive ? teamColor : "transparent"}`,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              opacity: isSitting ? 0.4 : 1,
            }}>
            {/* Batting spot */}
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 900,
              fontSize: isActive ? "1.1rem" : "0.9rem",
              color: isActive ? teamColor : "rgba(238,238,245,0.4)",
              width: 18, textAlign: "center", flexShrink: 0,
            }}>
              {i + 1}
            </span>
            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "0.8rem", fontWeight: isActive ? 700 : 500,
                color: isActive ? "#eeeef5" : "rgba(238,238,245,0.65)",
                fontFamily: "var(--font-body)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {slot.player.firstName} {slot.player.lastName}
                {isOnBase && (
                  <span style={{ marginLeft: 5, fontSize: "0.6rem",
                    color: teamColor, fontWeight: 800 }}>●</span>
                )}
              </div>
              <div style={{ fontSize: "0.65rem", color: "rgba(238,238,245,0.3)",
                fontFamily: "var(--font-mono)" }}>
                #{slot.player.jerseyNumber ?? "—"}
              </div>
            </div>
            {/* Position */}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700,
              color: isActive ? teamColor : isSitting ? "rgba(238,238,245,0.25)" : "rgba(238,238,245,0.45)",
              background: isActive ? `${teamColor}22` : "rgba(255,255,255,0.05)",
              padding: "2px 6px", borderRadius: 5, flexShrink: 0,
            }}>
              {posLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Play Log Panel ─────────────────────────────────────────────
function PlayLogPanel({
  plateAppearances, teamColor,
}: {
  plateAppearances: PlateAppearanceRecord[];
  teamColor: string;
}) {
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "12px 0" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
        color: "rgba(238,238,245,0.3)", padding: "0 12px 8px",
        fontFamily: "var(--font-display)" }}>
        PLAY LOG
      </div>
      {plateAppearances.length === 0 && (
        <div style={{ padding: "8px 12px", fontSize: "0.75rem",
          color: "rgba(238,238,245,0.3)", fontFamily: "var(--font-body)" }}>
          No plays yet
        </div>
      )}
      {plateAppearances.map((pa) => {
        const isH = isHitResult(pa.result);
        return (
          <div key={pa.id} style={{ padding: "8px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: isH ? `${teamColor}22` : "rgba(255,61,61,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.65rem",
              color: isH ? teamColor : "#ff6b6b" }}>
              {RESULT_LABELS[pa.result]}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#eeeef5",
                fontFamily: "var(--font-body)", lineHeight: 1.2 }}>
                {pa.player.firstName} {pa.player.lastName}
              </div>
              <div style={{ fontSize: "0.65rem", color: "rgba(238,238,245,0.35)",
                fontFamily: "var(--font-mono)" }}>
                Inn {pa.inningNumber}
                {pa.rbis > 0 ? ` · ${pa.rbis} RBI` : ""}
                {pa.runsScored ? " · R" : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Scorebook ─────────────────────────────────────────────
export function Scorebook({ game, teamName, teamColor }: ScoreboookProps) {
  const router = useRouter();

  const storageKey = `scorebook-${game.id}`;
  const getSaved = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) as {
        batterIndex?: number;
        atBatCounts?: Record<string, number>;
        runners?: Runners;
        currentInning?: number;
      } : null;
    } catch { return null; }
  };

  const [gameStarted, setGameStarted]   = useState(game.status === "IN_PROGRESS");
  const [currentInning, setCurrentInning] = useState(() => {
    const s = getSaved();
    if (s?.currentInning) return s.currentInning;
    return Math.max(1, (game.innings.find((i) => !i.isComplete)?.inningNumber ?? game.innings.length) || 1);
  });
  const [currentBatterIndex, setCurrentBatterIndex] = useState(() => getSaved()?.batterIndex ?? 0);
  const [atBatCounts, setAtBatCounts]   = useState<Record<string, number>>(() => getSaved()?.atBatCounts ?? {});
  const [runners, setRunners]           = useState<Runners>(() => getSaved()?.runners ?? { first: null, second: null, third: null });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ batterIndex: currentBatterIndex, atBatCounts, runners, currentInning }));
    } catch {}
  }, [currentBatterIndex, atBatCounts, runners, currentInning, storageKey]);

  const clearStorage = () => { try { localStorage.removeItem(storageKey); } catch {} };

  const [step, setStep]                     = useState<Step>("result");
  const [selectedResult, setSelectedResult] = useState<PlateAppearanceResult | null>(null);
  const [runnerDecisions, setRunnerDecisions] = useState<RunnerDecision[]>([]);
  const [batterFinalBase, setBatterFinalBase] = useState<Base | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [outsThisInning, setOutsThisInning] = useState(0);
  const [showInningEnd, setShowInningEnd]   = useState(false);

  // Snapshot stack for undo
  interface GameSnapshot {
    runners: Runners;
    outsThisInning: number;
    currentBatterIndex: number;
    teamTotal: number;
    opponentTotal: number;
    innings: Inning[];
  }
  const [history, setHistory] = useState<GameSnapshot[]>([]);

  const [innings, setInnings]               = useState<Inning[]>(game.innings);
  const [teamTotal, setTeamTotal]           = useState(game.teamRuns);
  const [opponentTotal, setOpponentTotal]   = useState(game.opponentRuns);
  const [plateAppearances, setPlateAppearances] = useState<PlateAppearanceRecord[]>(game.plateAppearances);

  const [confirmEnd, setConfirmEnd]             = useState(false);
  const [ending, setEnding]                     = useState(false);
  const [confirmRestart, setConfirmRestart]     = useState(false);
  const [restarting, setRestarting]             = useState(false);

  // Mobile right-side tab
  const [rightTab, setRightTab] = useState<RightTab>("lineup");

  const lineup = [...game.lineup].sort((a, b) => a.battingOrder - b.battingOrder);
  const currentBatter = lineup[currentBatterIndex % lineup.length];
  const hasRunners = runners.first || runners.second || runners.third;

  const getInning = (n: number) => innings.find((i) => i.inningNumber === n);
  const currentInningData = getInning(currentInning) ??
    { inningNumber: currentInning, teamRuns: 0, opponentRuns: 0, teamHits: 0, isComplete: false };
  const allInnings = Array.from(
    { length: Math.max(game.totalInnings, innings.length > 0 ? Math.max(...innings.map(i => i.inningNumber)) : 1) },
    (_, i) => i + 1
  );

  // ── Actions ────────────────────────────────────────────────
  const handleSelectResult = async (result: PlateAppearanceResult) => {
    setSelectedResult(result);
    setBatterFinalBase(null);

    const existingRunners: RunnerDecision[] = (["first","second","third"] as Base[])
      .filter((b) => runners[b] !== null)
      .map((b) => ({ player: runners[b]!, from: b, to: suggestRunnerDestination(b, result) }));
    setRunnerDecisions(existingRunners);

    const isHit = ["SINGLE","DOUBLE","TRIPLE"].includes(result);

    if (result === "REACHED_ON_ERROR") {
      setBatterFinalBase("first");
      setStep("error_base");
    } else if (isHit) {
      // Hits always go to confirm (batter may advance further on an error/overthrow)
      if (existingRunners.length > 0) {
        setStep("runners"); // runners first, then confirm
      } else {
        setStep("confirm"); // no runners, just the batter advancement question
      }
    } else if (existingRunners.length > 0 && result !== "HOME_RUN") {
      // Non-hit with runners — show runner screen then record directly
      setStep("runners");
    } else {
      // HR, outs, BB, HBP, SAC with no runners — record immediately
      await recordPA(result, null, existingRunners);
    }
  };

  const recordPA = async (
    result: PlateAppearanceResult,
    finalBase: Base | null,
    decisions: RunnerDecision[]
  ) => {
    if (!currentBatter || saving) return;
    setSaving(true);

    // Save snapshot before this PA for undo
    setHistory((prev) => [...prev, {
      runners: { ...runners },
      outsThisInning,
      currentBatterIndex,
      teamTotal,
      opponentTotal,
      innings: innings.map((i) => ({ ...i })),
    }]);
    const batter = currentBatter.player;
    const playerId = currentBatter.playerId;
    const atBatNum = (atBatCounts[playerId] ?? 0) + 1;
    const defaultBatterBase = result === "REACHED_ON_ERROR" ? finalBase : (finalBase ?? batterReachesBase(result));
    const batterBase = defaultBatterBase;
    let scoredRunners: SlimPlayer[] = [];
    let newRunners = { ...runners };
    if (result === "HOME_RUN") {
      scoredRunners = [runners.first, runners.second, runners.third, batter].filter(Boolean) as SlimPlayer[];
      newRunners = { first: null, second: null, third: null };
    } else {
      const applied = applyRunnerDecisions(decisions, batterBase, batter, result);
      scoredRunners = applied.scored;
      newRunners = applied.newRunners;
    }
    const rbis = scoredRunners.filter((p) => p.id !== batter.id).length
      + (scoredRunners.some((p) => p.id === batter.id) ? 1 : 0);
    const batterScored = scoredRunners.some((p) => p.id === batter.id);
    const isHit = isHitResult(result);
    const runsThisPA = scoredRunners.length;
    const newPA: PlateAppearanceRecord = {
      id: Math.random().toString(36).slice(2),
      playerId, inningNumber: currentInning,
      result, rbis: rbis - (batterScored ? 1 : 0),
      runsScored: batterScored,
      player: { firstName: batter.firstName, lastName: batter.lastName },
    };
    setPlateAppearances((prev) => [newPA, ...prev]);
    setAtBatCounts((prev) => ({ ...prev, [playerId]: atBatNum }));
    setRunners(newRunners);
    setInnings((prev) => {
      const exists = prev.find((i) => i.inningNumber === currentInning);
      if (exists) return prev.map((i) => i.inningNumber === currentInning
        ? { ...i, teamRuns: i.teamRuns + runsThisPA, teamHits: isHit ? i.teamHits + 1 : i.teamHits } : i);
      return [...prev, { inningNumber: currentInning, teamRuns: runsThisPA, opponentRuns: 0, teamHits: isHit ? 1 : 0, isComplete: false }];
    });
    setTeamTotal((prev) => prev + runsThisPA);
    await recordPlateAppearance({
      gameId: game.id, playerId, inningNumber: currentInning,
      battingOrderSlot: currentBatter.battingOrder, atBatNumber: atBatNum,
      result, rbis: rbis - (batterScored ? 1 : 0), runsScored: batterScored,
    });
    setCurrentBatterIndex((prev) => (prev + 1) % lineup.length);
    setSelectedResult(null); setRunnerDecisions([]); setBatterFinalBase(null); setStep("result");
    const isROEOut = result === "REACHED_ON_ERROR" && finalBase === null;
    const newOuts = outsThisInning + (isROEOut ? 1 : outsRecorded(result));
    setOutsThisInning(newOuts);
    if (newOuts >= 3) setShowInningEnd(true);
    setSaving(false);
  };

  const handleUndo = async () => {
    if (saving || history.length === 0) return;
    setSaving(true);
    const result = await undoLastPlateAppearance(game.id);
    if (result.success) {
      // Restore full state from last snapshot
      const snap = history[history.length - 1]!;
      setHistory((prev) => prev.slice(0, -1));
      setRunners(snap.runners);
      setOutsThisInning(snap.outsThisInning);
      setCurrentBatterIndex(snap.currentBatterIndex);
      setTeamTotal(snap.teamTotal);
      setOpponentTotal(snap.opponentTotal);
      setInnings(snap.innings);
      setPlateAppearances((prev) => prev.slice(1));
      setShowInningEnd(false);
    }
    setStep("result"); setSelectedResult(null); setSaving(false);
  };

  const handleOpponentRuns = async (delta: number) => {
    const newRuns = Math.max(0, currentInningData.opponentRuns + delta);
    setInnings((prev) => {
      const exists = prev.find((i) => i.inningNumber === currentInning);
      if (exists) return prev.map((i) => i.inningNumber === currentInning ? { ...i, opponentRuns: newRuns } : i);
      return [...prev, { inningNumber: currentInning, teamRuns: 0, opponentRuns: newRuns, teamHits: 0, isComplete: false }];
    });
    setOpponentTotal((prev) => Math.max(0, prev + delta));
    await updateOpponentScore(game.id, currentInning, newRuns);
  };

  const handleNextInning = async () => {
    if (saving) return;
    setSaving(true);
    const result = await nextInning(game.id, currentInning);
    if (result.success) {
      setInnings((prev) => prev.map((i) => i.inningNumber === currentInning ? { ...i, isComplete: true } : i));
      setCurrentInning((prev) => prev + 1);
      setRunners({ first: null, second: null, third: null });
      setOutsThisInning(0);
      setShowInningEnd(false);
      setHistory([]);
      setStep("result"); setSelectedResult(null);
    }
    setSaving(false);
  };

  const handleEndGame = async () => {
    setEnding(true); clearStorage();
    await endGame(game.id);
    router.push("/schedule");
  };

  const handleRestart = async () => {
    setRestarting(true); clearStorage();
    await restartGame(game.id);
    setGameStarted(false); setCurrentInning(1); setCurrentBatterIndex(0);
    setAtBatCounts({}); setRunners({ first: null, second: null, third: null });
    setInnings([]); setTeamTotal(0); setOpponentTotal(0); setPlateAppearances([]);
    setOutsThisInning(0); setShowInningEnd(false);
    setHistory([]);
    setStep("result"); setSelectedResult(null); setRunnerDecisions([]); setBatterFinalBase(null);
    setConfirmRestart(false); setRestarting(false);
  };

  // ── Base diamond ───────────────────────────────────────────
  const BaseDiamond = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginLeft: 8 }}>
      <div style={{ width: 14, height: 14, borderRadius: 3, transform: "rotate(45deg)",
        background: runners.second ? teamColor : "rgba(255,255,255,0.12)",
        border: `1px solid ${runners.second ? teamColor : "rgba(255,255,255,0.2)"}` }} />
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, transform: "rotate(45deg)",
          background: runners.third ? teamColor : "rgba(255,255,255,0.12)",
          border: `1px solid ${runners.third ? teamColor : "rgba(255,255,255,0.2)"}` }} />
        <div style={{ width: 14, height: 14, borderRadius: 3, transform: "rotate(45deg)",
          background: runners.first ? teamColor : "rgba(255,255,255,0.12)",
          border: `1px solid ${runners.first ? teamColor : "rgba(255,255,255,0.2)"}` }} />
      </div>
    </div>
  );

  // ── Pre-game screen ────────────────────────────────────────
  if (!gameStarted) {
    return (
      <div style={{ minHeight: "100vh", background: "#05050e", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700,
            letterSpacing: "0.2em", color: teamColor, marginBottom: 16 }}>GAME DAY</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,8vw,4rem)",
            fontWeight: 900, color: "#eeeef5", margin: "0 0 8px", lineHeight: 1 }}>
            vs {game.opponent}
          </h1>
          <p style={{ color: "rgba(238,238,245,0.5)", fontFamily: "var(--font-body)",
            fontSize: "0.875rem", marginBottom: 40 }}>
            {game.totalInnings} innings · {lineup.length} in lineup
          </p>
          {lineup.length === 0 && (
            <div style={{ background: "rgba(255,61,61,0.1)", border: "1px solid rgba(255,61,61,0.3)",
              borderRadius: 12, padding: 20, marginBottom: 24, color: "#ff3d3d",
              fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
              ⚠ No lineup set. Go to the Lineup tab first.
            </div>
          )}
          {lineup.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: 16, marginBottom: 32, textAlign: "left" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "0.15em", color: "rgba(238,238,245,0.4)", marginBottom: 10 }}>BATTING ORDER</div>
              {lineup.map((slot, i) => (
                <div key={slot.playerId} style={{ display: "flex", alignItems: "center", gap: 12,
                  padding: "6px 0", borderBottom: i < lineup.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                    fontSize: "1.1rem", color: teamColor, width: 20, textAlign: "center" }}>{i + 1}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                    color: "rgba(238,238,245,0.4)", width: 28 }}>#{slot.player.jerseyNumber ?? "—"}</span>
                  <span style={{ flex: 1, fontSize: "0.875rem", color: "#eeeef5", fontFamily: "var(--font-body)" }}>
                    {slot.player.firstName} {slot.player.lastName}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700,
                    color: "rgba(238,238,245,0.4)", background: "rgba(255,255,255,0.06)",
                    padding: "2px 8px", borderRadius: 4 }}>
                    {POS_SHORT[slot.inningPositions?.[1] ?? slot.fieldingPosition] ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button onClick={async () => { await startGame(game.id); setGameStarted(true); }}
            disabled={lineup.length === 0}
            style={{ width: "100%", padding: "18px 24px", borderRadius: 14, border: "none",
              background: lineup.length === 0 ? "rgba(255,255,255,0.06)" : teamColor,
              color: lineup.length === 0 ? "rgba(238,238,245,0.3)" : "#000",
              fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 900,
              letterSpacing: "0.05em", cursor: lineup.length === 0 ? "default" : "pointer" }}>
            ⚡ START GAME
          </button>
        </div>
      </div>
    );
  }

  // ── Scorebook ──────────────────────────────────────────────
  // Shared right-side content (lineup + log) rendered differently on mobile vs desktop
  const lineupPanel = (
    <LineupPanel
      lineup={lineup}
      currentBatterIndex={currentBatterIndex}
      currentInning={currentInning}
      teamColor={teamColor}
      runners={runners}
    />
  );
  const logPanel = (
    <PlayLogPanel plateAppearances={plateAppearances} teamColor={teamColor} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#05050e", display: "flex",
      flexDirection: "column", fontFamily: "var(--font-body)" }}>

      {/* Top bar */}
      <div style={{ background: "#0a0a1a", borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#e02020", color: "#fff", fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: "0.65rem", letterSpacing: "0.15em",
            padding: "3px 8px", borderRadius: 4, animation: "pulse 1.5s infinite" }}>● LIVE</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1rem", color: "rgba(238,238,245,0.6)" }}>INN {currentInning}</span>
          <span style={{ fontSize: "0.75rem", color: "rgba(238,238,245,0.35)",
            fontFamily: "var(--font-body)" }}>of {game.totalInnings}</span>
          <BaseDiamond />
          {/* Out counter */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: "50%",
                background: i < outsThisInning ? "#ff3d3d" : "rgba(255,255,255,0.15)",
                border: `1px solid ${i < outsThisInning ? "#ff3d3d" : "rgba(255,255,255,0.2)"}`,
                transition: "all 0.2s",
              }} />
            ))}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem",
              color: "rgba(238,238,245,0.35)", marginLeft: 3 }}>OUT</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleUndo} disabled={saving || history.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8,
              color: "rgba(238,238,245,0.6)", padding: "7px 12px",
              fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer", opacity: history.length === 0 ? 0.3 : 1 }}>
            <FontAwesomeIcon icon={faRotateLeft} style={{ width: 13, height: 13 }} />
            Undo
          </button>
          {currentInning < game.totalInnings && (
            <button onClick={handleNextInning} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8,
                color: teamColor, padding: "7px 12px",
                fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              <FontAwesomeIcon icon={faForwardStep} style={{ width: 13, height: 13 }} />
              Next Inn
            </button>
          )}
          <button onClick={() => setConfirmRestart(true)}
            style={{ display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "rgba(238,238,245,0.5)", padding: "7px 12px",
              fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            <FontAwesomeIcon icon={faRotateLeft} style={{ width: 13, height: 13 }} />
            Restart
          </button>
          <button onClick={() => setConfirmEnd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,61,61,0.15)", border: "1px solid rgba(255,61,61,0.3)",
              borderRadius: 8, color: "#ff3d3d", padding: "7px 12px",
              fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            <FontAwesomeIcon icon={faStop} style={{ width: 13, height: 13 }} />
            End
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{ background: "#080818", borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 16px", flexShrink: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}>
          <thead>
            <tr>
              <td style={{ width: 72, fontFamily: "var(--font-display)", fontSize: "0.6rem",
                fontWeight: 700, letterSpacing: "0.12em", color: "rgba(238,238,245,0.35)", paddingBottom: 4 }}>TEAM</td>
              {allInnings.map((n) => (
                <td key={n} style={{ textAlign: "center", width: 30, fontFamily: "var(--font-display)",
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", paddingBottom: 4,
                  color: n === currentInning ? teamColor : "rgba(238,238,245,0.35)" }}>{n}</td>
              ))}
              <td style={{ textAlign: "center", width: 36, fontFamily: "var(--font-display)",
                fontSize: "0.6rem", fontWeight: 700, color: "rgba(238,238,245,0.35)",
                paddingBottom: 4, paddingLeft: 8, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>R</td>
              <td style={{ textAlign: "center", width: 36, fontFamily: "var(--font-display)",
                fontSize: "0.6rem", fontWeight: 700, color: "rgba(238,238,245,0.35)", paddingBottom: 4 }}>H</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.75rem",
                color: teamColor, paddingRight: 8, whiteSpace: "nowrap", overflow: "hidden",
                maxWidth: 72, textOverflow: "ellipsis" }}>
                {teamName.split(" ")[0]?.toUpperCase()}
              </td>
              {allInnings.map((n) => {
                const inn = getInning(n);
                return (
                  <td key={n} style={{ textAlign: "center", fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem", fontWeight: n === currentInning ? 700 : 400,
                    color: n === currentInning ? "#eeeef5" : "rgba(238,238,245,0.5)",
                    background: n === currentInning ? "rgba(255,255,255,0.04)" : "transparent",
                    borderRadius: 4, padding: "2px 0" }}>
                    {inn ? inn.teamRuns : "·"}
                  </td>
                );
              })}
              <td style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "1.1rem",
                fontWeight: 900, color: teamColor, paddingLeft: 8,
                borderLeft: "1px solid rgba(255,255,255,0.08)" }}>{teamTotal}</td>
              <td style={{ textAlign: "center", fontFamily: "var(--font-mono)",
                fontSize: "0.9rem", color: "rgba(238,238,245,0.5)" }}>
                {innings.reduce((s, i) => s + i.teamHits, 0)}
              </td>
            </tr>
            <tr>
              <td style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.75rem",
                color: "rgba(238,238,245,0.6)", paddingRight: 8, whiteSpace: "nowrap",
                overflow: "hidden", maxWidth: 72, textOverflow: "ellipsis" }}>
                {game.opponent.split(" ")[0]?.toUpperCase()}
              </td>
              {allInnings.map((n) => {
                const inn = getInning(n);
                return (
                  <td key={n} style={{ textAlign: "center", fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem", color: "rgba(238,238,245,0.5)",
                    background: n === currentInning ? "rgba(255,255,255,0.03)" : "transparent",
                    borderRadius: 4, padding: "2px 0" }}>
                    {inn ? inn.opponentRuns : "·"}
                  </td>
                );
              })}
              <td style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "1.1rem",
                fontWeight: 900, color: "rgba(238,238,245,0.6)", paddingLeft: 8,
                borderLeft: "1px solid rgba(255,255,255,0.08)" }}>{opponentTotal}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── End of Half-Inning screen ──────────────────────────────── */}
      {showInningEnd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(5,5,14,0.97)", display: "flex",
          flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "#0a0a1a", borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "14px 20px", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", fontWeight: 700,
              letterSpacing: "0.2em", color: "rgba(238,238,245,0.4)", marginBottom: 2 }}>
              END OF INNING {currentInning}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                fontSize: "2rem", color: teamColor }}>{teamTotal}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 400,
                fontSize: "1rem", color: "rgba(238,238,245,0.3)" }}>–</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                fontSize: "2rem", color: "rgba(238,238,245,0.6)" }}>{opponentTotal}</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 720, margin: "0 auto" }}>

              {/* Fielding positions this inning */}
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "0.15em", color: "rgba(238,238,245,0.35)", marginBottom: 10 }}>
                  YOUR LINEUP — INN {currentInning}
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
                  {lineup.map((slot, i) => {
                    const pos = slot.inningPositions?.[currentInning] ?? slot.fieldingPosition;
                    const posLabel = POS_SHORT[pos] ?? "—";
                    const isSit = pos === "SIT";
                    return (
                      <div key={slot.playerId}
                        style={{ display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 14px",
                          borderBottom: i < lineup.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                          opacity: isSit ? 0.35 : 1 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                          fontSize: "0.9rem", color: teamColor, width: 18, textAlign: "center" }}>
                          {i + 1}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                          color: "rgba(238,238,245,0.35)", width: 26 }}>
                          #{slot.player.jerseyNumber ?? "—"}
                        </span>
                        <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500,
                          color: "#eeeef5", fontFamily: "var(--font-body)" }}>
                          {slot.player.firstName} {slot.player.lastName}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                          fontWeight: 700, color: isSit ? "rgba(238,238,245,0.25)" : teamColor,
                          background: isSit ? "rgba(255,255,255,0.04)" : `${teamColor}22`,
                          padding: "2px 8px", borderRadius: 5 }}>
                          {posLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Opponent runs this inning */}
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "0.15em", color: "rgba(238,238,245,0.35)", marginBottom: 10 }}>
                  {game.opponent.toUpperCase()} — RUNS THIS INNING
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center",
                    marginBottom: 16 }}>
                    <button onClick={() => handleOpponentRuns(-1)}
                      style={{ width: 56, height: 56, borderRadius: 12, border: "none",
                        background: "rgba(255,255,255,0.08)", color: "#eeeef5",
                        fontSize: "1.5rem", cursor: "pointer" }}>
                      –
                    </button>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "4rem",
                      fontWeight: 900, color: "rgba(238,238,245,0.8)", minWidth: 64, textAlign: "center",
                      lineHeight: 1 }}>
                      {currentInningData.opponentRuns}
                    </span>
                    <button onClick={() => handleOpponentRuns(1)}
                      style={{ width: 56, height: 56, borderRadius: 12, border: "none",
                        background: "rgba(255,255,255,0.08)", color: "#eeeef5",
                        fontSize: "1.5rem", cursor: "pointer" }}>
                      +
                    </button>
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "var(--font-body)",
                    fontSize: "0.75rem", color: "rgba(238,238,245,0.35)" }}>
                    Total: {opponentTotal} runs
                  </div>
                </div>

                {/* Inning summary */}
                <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700,
                    letterSpacing: "0.15em", color: "rgba(238,238,245,0.35)", marginBottom: 8 }}>
                    INN {currentInning} SUMMARY
                  </div>
                  {[
                    { label: `${teamName} Runs`, value: currentInningData.teamRuns, color: teamColor },
                    { label: `${game.opponent} Runs`, value: currentInningData.opponentRuns, color: "rgba(238,238,245,0.6)" },
                    { label: "Hits", value: currentInningData.teamHits, color: "rgba(238,238,245,0.5)" },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "4px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: "0.8rem", color: "rgba(238,238,245,0.5)",
                        fontFamily: "var(--font-body)" }}>{s.label}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "1rem", color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next inning button */}
          <div style={{ padding: 20, flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: 12 }}>
            <button onClick={() => setShowInningEnd(false)}
              style={{ padding: "14px 24px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent", color: "rgba(238,238,245,0.5)",
                fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer" }}>
              ← Back
            </button>
            {currentInning < game.totalInnings ? (
              <button onClick={handleNextInning} disabled={saving}
                style={{ flex: 1, padding: "16px 24px", borderRadius: 12, border: "none",
                  background: teamColor, color: "#000",
                  fontFamily: "var(--font-display)", fontSize: "1.2rem",
                  fontWeight: 900, letterSpacing: "0.05em",
                  cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                NEXT INNING →
              </button>
            ) : (
              <button onClick={() => setConfirmEnd(true)}
                style={{ flex: 1, padding: "16px 24px", borderRadius: 12, border: "none",
                  background: "#e02020", color: "#fff",
                  fontFamily: "var(--font-display)", fontSize: "1.2rem",
                  fontWeight: 900, letterSpacing: "0.05em", cursor: "pointer" }}>
                END GAME
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main 3-col layout (desktop) / 2-col with tabs (mobile) ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

        {/* ── LEFT: Lineup panel (desktop/tablet only) ─────── */}
        <div style={{ width: 200, borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0, display: "none" }}
          className="scorebook-lineup-panel">
          {lineupPanel}
        </div>

        {/* ── CENTER: Scorebook actions ─────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

          {/* Current batter */}
          {currentBatter && (
            <div style={{ background: `${teamColor}18`, border: `1px solid ${teamColor}44`,
              borderRadius: 14, padding: "12px 16px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "center", minWidth: 40 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 900,
                  fontSize: "2rem", color: teamColor, lineHeight: 1 }}>
                  {(currentBatterIndex % lineup.length) + 1}
                </div>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                  color: "rgba(238,238,245,0.4)", textTransform: "uppercase" }}>spot</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: "1.2rem", color: "#eeeef5", lineHeight: 1.1 }}>
                  {currentBatter.player.firstName} {currentBatter.player.lastName}
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(238,238,245,0.4)",
                  fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  #{currentBatter.player.jerseyNumber ?? "—"} · AB #{(atBatCounts[currentBatter.playerId] ?? 0) + 1}
                  {" · "}
                  {POS_SHORT[currentBatter.inningPositions?.[currentInning] ?? currentBatter.fieldingPosition] ?? "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => { setCurrentBatterIndex((p) => (p - 1 + lineup.length) % lineup.length); setStep("result"); setSelectedResult(null); }}
                  style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
                    color: "rgba(238,238,245,0.5)", padding: "8px 10px", cursor: "pointer" }}>
                  <FontAwesomeIcon icon={faChevronLeft} style={{ width: 12, height: 12 }} />
                </button>
                <button onClick={() => { setCurrentBatterIndex((p) => (p + 1) % lineup.length); setStep("result"); setSelectedResult(null); }}
                  style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
                    color: "rgba(238,238,245,0.5)", padding: "8px 10px", cursor: "pointer" }}>
                  <FontAwesomeIcon icon={faChevronRight} style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Result picker */}
          {step === "result" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
                  color: "rgba(238,238,245,0.35)", marginBottom: 8, fontFamily: "var(--font-display)" }}>HITS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {HITS.map((h) => (
                    <button key={h.result} onClick={() => handleSelectResult(h.result)}
                      style={{ padding: "18px 8px", borderRadius: 12, border: `1px solid ${h.color}44`,
                        background: h.bg, color: h.color,
                        fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, cursor: "pointer" }}>
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
                  color: "rgba(238,238,245,0.35)", marginBottom: 8, fontFamily: "var(--font-display)" }}>OUTS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {OUTS.map((o) => (
                    <button key={o.result} onClick={() => handleSelectResult(o.result)}
                      style={{ padding: "14px 8px", borderRadius: 12, border: "1px solid rgba(255,61,61,0.25)",
                        background: "rgba(255,61,61,0.08)", color: "#ff6b6b",
                        fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, cursor: "pointer" }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
                  color: "rgba(238,238,245,0.35)", marginBottom: 8, fontFamily: "var(--font-display)" }}>OTHER</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {OTHER.map((o) => (
                    <button key={o.result} onClick={() => handleSelectResult(o.result)}
                      style={{ padding: "14px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.05)", color: "#eeeef5",
                        fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer" }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
                  color: "rgba(238,238,245,0.35)", marginBottom: 8, fontFamily: "var(--font-display)" }}>ERROR</div>
                <button onClick={() => handleSelectResult("REACHED_ON_ERROR")}
                  style={{ width: "100%", padding: "14px 8px", borderRadius: 12,
                    border: "1px solid rgba(251,191,36,0.3)",
                    background: "rgba(251,191,36,0.08)", color: "#fbbf24",
                    fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, cursor: "pointer" }}>
                  E — Error
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Runner advancement */}
          {step === "runners" && selectedResult && (
            <div>
              <div style={{ background: isHitResult(selectedResult) ? `${teamColor}18` : "rgba(255,61,61,0.08)",
                border: `1px solid ${isHitResult(selectedResult) ? `${teamColor}44` : "rgba(255,61,61,0.25)"}`,
                borderRadius: 12, padding: "12px 16px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
                  color: isHitResult(selectedResult) ? teamColor : "#ff6b6b" }}>
                  {RESULT_LABELS[selectedResult]}
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#eeeef5", fontFamily: "var(--font-body)" }}>
                    {currentBatter?.player.firstName} {currentBatter?.player.lastName}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(238,238,245,0.4)", fontFamily: "var(--font-body)" }}>
                    Where do the runners go?
                  </div>
                </div>
              </div>
              <RunnerAdvancement decisions={runnerDecisions} onChange={setRunnerDecisions}
                result={selectedResult} teamColor={teamColor} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginTop: 20 }}>
                <button onClick={() => { setStep("result"); setSelectedResult(null); }}
                  style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)", color: "#eeeef5",
                    fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedResult) return;
                    const isHitResult_ = ["SINGLE","DOUBLE","TRIPLE"].includes(selectedResult);
                    if (isHitResult_) {
                      setStep("confirm");
                    } else {
                      recordPA(selectedResult, batterFinalBase, runnerDecisions);
                    }
                  }}
                  disabled={saving}
                  style={{ padding: "14px", borderRadius: 12, border: "none",
                    background: teamColor, color: "#000",
                    fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 900,
                    cursor: "pointer", letterSpacing: "0.04em", opacity: saving ? 0.6 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <FontAwesomeIcon icon={faCheck} style={{ width: 15, height: 15 }} />
                  {["SINGLE","DOUBLE","TRIPLE"].includes(selectedResult ?? "") ? "NEXT →" : "CONFIRM"}
                </button>
              </div>
            </div>
          )}

          {/* Error base picker */}
          {step === "error_base" && selectedResult === "REACHED_ON_ERROR" && (
            <div>
              <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: 14, padding: "16px 20px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem",
                  fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>E</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(238,238,245,0.5)",
                  fontFamily: "var(--font-body)", marginTop: 4 }}>
                  {currentBatter?.player.firstName} {currentBatter?.player.lastName} — Error
                </div>
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em",
                color: "rgba(238,238,245,0.35)", marginBottom: 14, fontFamily: "var(--font-display)" }}>
                WHERE DID THE BATTER END UP?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                {([
                  { base: "first",  label: "1st",  color: teamColor  },
                  { base: "second", label: "2nd",  color: teamColor  },
                  { base: "third",  label: "3rd",  color: teamColor  },
                  { base: null,     label: "Out",  color: "#ff3d3d"  },
                ] as const).map((opt) => {
                  const active = batterFinalBase === opt.base;
                  return (
                    <button key={String(opt.base)} type="button"
                      onClick={() => setBatterFinalBase(opt.base)}
                      style={{
                        padding: "18px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: active ? opt.color : "rgba(255,255,255,0.06)",
                        color: active ? (opt.color === "#ff3d3d" ? "#fff" : "#000") : "rgba(238,238,245,0.7)",
                        fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900,
                        outline: active ? `2px solid ${opt.color}` : "none",
                        outlineOffset: 2, transition: "all 0.1s",
                      }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <button onClick={() => { setStep("result"); setSelectedResult(null); }}
                  style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)", color: "#eeeef5",
                    fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
                  ← Back
                </button>
                <button
                  onClick={() => recordPA("REACHED_ON_ERROR", batterFinalBase, runnerDecisions)}
                  disabled={saving}
                  style={{ padding: "14px", borderRadius: 12, border: "none",
                    background: teamColor, color: "#000",
                    fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 900,
                    cursor: "pointer", letterSpacing: "0.04em", opacity: saving ? 0.6 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <FontAwesomeIcon icon={faCheck} style={{ width: 15, height: 15 }} />
                  CONFIRM
                </button>
              </div>
            </div>
          )}

          {/* Confirm step — hits only, batter advancement question */}
          {step === "confirm" && selectedResult && (
            <div>
              <div style={{ background: `${teamColor}18`, border: `1px solid ${teamColor}44`,
                borderRadius: 14, padding: "16px 20px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem",
                  fontWeight: 900, color: teamColor, lineHeight: 1 }}>
                  {RESULT_LABELS[selectedResult]}
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(238,238,245,0.5)",
                  fontFamily: "var(--font-body)", marginTop: 4 }}>
                  {currentBatter?.player.firstName} {currentBatter?.player.lastName}
                </div>
              </div>

              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em",
                color: "rgba(238,238,245,0.35)", marginBottom: 12, fontFamily: "var(--font-display)" }}>
                DID THE BATTER ADVANCE FURTHER?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                {([
                  { base: null,     label: "No — stayed" },
                  { base: "second", label: "→ 2nd"       },
                  { base: "third",  label: "→ 3rd"       },
                  { base: "scored" as const, label: "Scored"    },
                ] as const).filter((opt) => {
                  const defaultBase = batterReachesBase(selectedResult);
                  if (opt.base === null) return true;
                  if (opt.base === "second") return defaultBase === "first";
                  if (opt.base === "third")  return defaultBase === "first" || defaultBase === "second";
                  if (opt.base === "scored") return true;
                  return false;
                }).map((opt) => {
                  const active = opt.base === "scored"
                    ? batterFinalBase === "scored" as unknown as Base
                    : batterFinalBase === opt.base;
                  const color = opt.base === "scored" ? "#fbbf24" : teamColor;
                  return (
                    <button key={String(opt.base)} type="button"
                      onClick={() => setBatterFinalBase(opt.base === "scored" ? "scored" as unknown as Base : opt.base)}
                      style={{
                        padding: "16px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: active ? color : "rgba(255,255,255,0.06)",
                        color: active ? "#000" : "rgba(238,238,245,0.7)",
                        fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 900,
                        outline: active ? `2px solid ${color}` : "none",
                        outlineOffset: 2, transition: "all 0.1s",
                      }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <button onClick={() => setStep(runnerDecisions.length > 0 ? "runners" : "result")}
                  style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)", color: "#eeeef5",
                    fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedResult) return;
                    // If batter scored, treat as scored (null base, runsScored=true handled in recordPA)
                    const finalBase = (batterFinalBase as unknown as string) === "scored"
                      ? null
                      : batterFinalBase;
                    recordPA(selectedResult, finalBase, runnerDecisions);
                  }}
                  disabled={saving}
                  style={{ padding: "14px", borderRadius: 12, border: "none",
                    background: teamColor, color: "#000",
                    fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 900,
                    cursor: "pointer", letterSpacing: "0.04em", opacity: saving ? 0.6 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <FontAwesomeIcon icon={faCheck} style={{ width: 15, height: 15 }} />
                  CONFIRM
                </button>
              </div>
            </div>
          )}

          {/* Opponent score */}
          <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
              color: "rgba(238,238,245,0.35)", marginBottom: 10, fontFamily: "var(--font-display)" }}>
              {game.opponent.toUpperCase()} — INN {currentInning}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => handleOpponentRuns(-1)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.07)", color: "#eeeef5",
                  fontSize: "1.2rem", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faMinus} style={{ width: 16, height: 16 }} />
              </button>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem",
                fontWeight: 900, color: "rgba(238,238,245,0.7)", minWidth: 48, textAlign: "center" }}>
                {currentInningData.opponentRuns}
              </span>
              <button onClick={() => handleOpponentRuns(1)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.07)", color: "#eeeef5",
                  fontSize: "1.2rem", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faPlus} style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Desktop shows lineup + log stacked; mobile is tabbed ── */}
        <div style={{ width: 220, borderLeft: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 }}
          className="scorebook-right-panel">

          {/* Mobile tab switcher (hidden on desktop via CSS) */}
          <div className="scorebook-mobile-tabs"
            style={{ display: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            {([
              { id: "lineup" as RightTab, label: "Lineup", icon: faListOl },
              { id: "log"    as RightTab, label: "Log",    icon: faScroll },
            ]).map((t) => (
              <button key={t.id} onClick={() => setRightTab(t.id)}
                style={{ flex: 1, padding: "10px 8px", border: "none", cursor: "pointer",
                  background: rightTab === t.id ? `${teamColor}18` : "transparent",
                  color: rightTab === t.id ? teamColor : "rgba(238,238,245,0.4)",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.75rem",
                  borderBottom: `2px solid ${rightTab === t.id ? teamColor : "transparent"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FontAwesomeIcon icon={t.icon} style={{ width: 12, height: 12 }} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Desktop: both panels stacked */}
          <div className="scorebook-desktop-right"
            style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: "0 0 50%", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {lineupPanel}
            </div>
            <div style={{ flex: "0 0 50%", overflow: "hidden" }}>
              {logPanel}
            </div>
          </div>

          {/* Mobile: show active tab only */}
          <div className="scorebook-mobile-content"
            style={{ display: "none", flex: 1, overflow: "hidden" }}>
            {rightTab === "lineup" ? lineupPanel : logPanel}
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          .scorebook-lineup-panel { display: block !important; }
        }
        @media (max-width: 767px) {
          .scorebook-mobile-tabs { display: flex !important; }
          .scorebook-desktop-right { display: none !important; }
          .scorebook-mobile-content { display: block !important; }
          .scorebook-right-panel { width: 180px !important; }
        }
      `}</style>

      {/* End game confirm */}
      {confirmEnd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#0d0d1c", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: 32, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem",
              fontWeight: 900, color: "#eeeef5", marginBottom: 8 }}>End Game?</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "var(--font-display)", marginBottom: 8 }}>
              <span style={{ color: teamColor }}>{teamTotal}</span>
              <span style={{ color: "rgba(238,238,245,0.3)", margin: "0 12px" }}>–</span>
              <span style={{ color: "rgba(238,238,245,0.6)" }}>{opponentTotal}</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "rgba(238,238,245,0.5)",
              fontFamily: "var(--font-body)", marginBottom: 24 }}>
              Stats will be calculated and saved for all players.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={() => setConfirmEnd(false)} disabled={ending}
                style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent", color: "#eeeef5",
                  fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleEndGame} disabled={ending}
                style={{ padding: "14px", borderRadius: 12, border: "none",
                  background: "#e02020", color: "#fff",
                  fontFamily: "var(--font-display)", fontSize: "0.9rem",
                  fontWeight: 900, cursor: "pointer", opacity: ending ? 0.6 : 1 }}>
                {ending ? "Saving..." : "End Game"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart confirm */}
      {confirmRestart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#0d0d1c", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: 32, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem",
              fontWeight: 900, color: "#eeeef5", marginBottom: 8 }}>Restart Game?</div>
            <p style={{ fontSize: "0.875rem", color: "rgba(238,238,245,0.5)",
              fontFamily: "var(--font-body)", marginBottom: 24 }}>
              This will erase all scoring, plate appearances, and stats for this game.
              The game will go back to Scheduled. This cannot be undone.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={() => setConfirmRestart(false)} disabled={restarting}
                style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent", color: "#eeeef5",
                  fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleRestart} disabled={restarting}
                style={{ padding: "14px", borderRadius: 12, border: "none",
                  background: "rgba(255,255,255,0.1)", color: "#eeeef5",
                  fontFamily: "var(--font-display)", fontSize: "0.9rem",
                  fontWeight: 900, cursor: "pointer", opacity: restarting ? 0.6 : 1 }}>
                {restarting ? "Restarting..." : "Yes, Restart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
