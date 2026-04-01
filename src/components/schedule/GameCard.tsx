"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt, faTrash, faPencil, faLocationDot,
  faHome, faPlaneUp, faClock, faCheck,
  faXmark, faSpinner, faQuestion, faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import { deleteGame, updateGame, setGameHomeAway, logGameScore } from "@/server/actions/games";
import type { GameStatus } from "@prisma/client";

const STATUS_STYLES: Record<GameStatus, { label: string; color: string; bg: string; border: string }> = {
  SCHEDULED:   { label: "Scheduled",   color: "#eeeef5",  bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
  IN_PROGRESS: { label: "Live",        color: "#ff3d3d",  bg: "rgba(255,61,61,0.12)",   border: "rgba(255,61,61,0.3)" },
  FINAL:       { label: "Final",       color: "#00e87a",  bg: "rgba(0,232,122,0.12)",   border: "rgba(0,232,122,0.3)" },
  POSTPONED:   { label: "Postponed",   color: "#f59e0b",  bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
  CANCELLED:   { label: "Cancelled",   color: "#888",     bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  FORFEIT:     { label: "Forfeit",     color: "#888",     bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
};

interface Game {
  id: string;
  opponent: string;
  gameDate: Date;
  location: string | null;
  isHome: boolean | null;
  status: GameStatus;
  teamRuns: number;
  opponentRuns: number;
  totalInnings: number;
  notes: string | null;
}

interface GameCardProps {
  game: Game;
  teamName: string;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(date: Date) {
  const d = new Date(date);
  if (d.getHours() === 0 && d.getMinutes() === 0) return null;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function GameCard({ game, teamName }: GameCardProps) {
  const [editing, setEditing]     = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [isHome, setIsHome]       = useState<boolean | null>(game.isHome);
  const [pickingHomeAway, setPickingHomeAway] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);
  const [loggingScore, setLoggingScore]   = useState(false);
  const [logTeamRuns, setLogTeamRuns]     = useState(0);
  const [logOppRuns, setLogOppRuns]       = useState(0);
  const [logSaving, setLogSaving]         = useState(false);
  const [logError, setLogError]           = useState("");
  const router = useRouter();

  const status = STATUS_STYLES[game.status];
  const isFinal = game.status === "FINAL";
  const isLive  = game.status === "IN_PROGRESS";
  const won     = isFinal && game.teamRuns > game.opponentRuns;
  const lost    = isFinal && game.teamRuns < game.opponentRuns;
  const time    = formatTime(game.gameDate);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("isHome", isHome === null ? "null" : String(isHome));
    const result = await updateGame(game.id, formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    else setEditing(false);
  };

  if (loggingScore) {
    return (
      <div className="rounded-[14px] p-5 mb-3"
        style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-brand)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem",
            color: "var(--color-text-primary)", margin: 0 }}>
            Log Score — vs {game.opponent}
          </h3>
          <button onClick={() => setLoggingScore(false)}
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
            <FontAwesomeIcon icon={faXmark} style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-5">
          {[
            { label: "Your Team", value: logTeamRuns, set: setLogTeamRuns },
            { label: game.opponent, value: logOppRuns, set: setLogOppRuns },
          ].map((side) => (
            <div key={side.label}>
              <div className="field-label mb-3">{side.label}</div>
              <div className="flex items-center gap-3 justify-center">
                <button onClick={() => side.set((p) => Math.max(0, p - 1))}
                  style={{ width: 40, height: 40, borderRadius: 10, border: "none",
                    background: "rgba(255,255,255,0.08)", color: "#eeeef5",
                    fontSize: "1.2rem", cursor: "pointer" }}>–</button>
                <input
                  type="number" min={0} max={99}
                  value={side.value}
                  onChange={(e) => side.set(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: 64, textAlign: "center", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                    padding: "8px 4px", color: "#eeeef5", fontFamily: "var(--font-display)",
                    fontSize: "1.75rem", fontWeight: 900, outline: "none" }}
                />
                <button onClick={() => side.set((p) => Math.min(99, p + 1))}
                  style={{ width: 40, height: 40, borderRadius: 10, border: "none",
                    background: "rgba(255,255,255,0.08)", color: "#eeeef5",
                    fontSize: "1.2rem", cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Result preview */}
        <div className="mb-4 rounded-lg px-4 py-2 text-center text-sm font-semibold"
          style={{
            background: logTeamRuns > logOppRuns
              ? "rgba(0,232,122,0.1)" : logTeamRuns < logOppRuns
              ? "rgba(255,61,61,0.1)" : "rgba(255,255,255,0.06)",
            color: logTeamRuns > logOppRuns ? "#00e87a"
              : logTeamRuns < logOppRuns ? "#ff3d3d" : "rgba(238,238,245,0.5)",
            fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700,
          }}>
          {logTeamRuns > logOppRuns ? "WIN" : logTeamRuns < logOppRuns ? "LOSS" : "TIE"} — {logTeamRuns}–{logOppRuns}
        </div>

        {logError && (
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--color-danger-400)" }}>⚠ {logError}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={async () => {
              setLogSaving(true); setLogError("");
              const result = await logGameScore(game.id, logTeamRuns, logOppRuns);
              setLogSaving(false);
              if (result?.error) setLogError(result.error);
              else setLoggingScore(false);
            }}
            disabled={logSaving}
            style={{ display: "flex", alignItems: "center", gap: 8,
              background: "var(--color-text-brand)", color: "#000",
              fontFamily: "var(--font-display)", fontSize: "0.9rem", letterSpacing: "0.05em",
              border: "none", borderRadius: 8, padding: "10px 20px",
              fontWeight: 700, cursor: "pointer", opacity: logSaving ? 0.6 : 1 }}>
            {logSaving
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 14, height: 14 }} />
              : <FontAwesomeIcon icon={faCheck} style={{ width: 14, height: 14 }} />
            }
            SAVE SCORE
          </button>
          <button onClick={() => setLoggingScore(false)}
            style={{ background: "rgba(255,255,255,0.06)", color: "#eeeef5",
              border: "none", borderRadius: 8, padding: "10px 18px",
              fontFamily: "var(--font-body)", fontSize: "0.875rem", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-[14px] p-5"
        style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-brand)", marginBottom: 12 }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-primary)", margin: 0 }}>
            Edit Game
          </h3>
          <button onClick={() => setEditing(false)}
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
            <FontAwesomeIcon icon={faXmark} style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <form onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="field-label">Opponent</label>
              <input name="opponent" className="input" defaultValue={game.opponent} required />
            </div>
            <div>
              <label className="field-label">Date</label>
              <input name="gameDate" type="date" className="input"
                defaultValue={new Date(game.gameDate).toISOString().split("T")[0]} required />
            </div>
            <div>
              <label className="field-label">Time</label>
              <input name="gameTime" type="time" className="input"
                defaultValue={time ? new Date(game.gameDate).toTimeString().slice(0, 5) : ""} />
            </div>
            <div>
              <label className="field-label">Location</label>
              <input name="location" className="input" defaultValue={game.location ?? ""} />
            </div>
            <div>
              <label className="field-label">Innings</label>
              <select name="totalInnings" className="input"
                defaultValue={game.totalInnings}
                style={{ background: "var(--color-surface-card2)", color: "#eeeef5", cursor: "pointer" }}>
                {[5, 6, 7, 9].map((n) => (
                  <option key={n} value={n} style={{ background: "#111125", color: "#eeeef5" }}>
                    {n} innings{n === 7 ? " (standard)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="field-label mb-2">Game Location</div>
              <div className="flex gap-2">
                {([
                  { val: true,  label: "Home", icon: faHome    },
                  { val: false, label: "Away", icon: faPlaneUp },
                  { val: null,  label: "TBD",  icon: faQuestion },
                ] as const).map((opt) => {
                  const active = isHome === opt.val;
                  return (
                    <button key={String(opt.val)} type="button" onClick={() => setIsHome(opt.val)}
                      style={{
                        flex: 1, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${active ? "rgba(0,232,122,0.5)" : "rgba(255,255,255,0.18)"}`,
                        background: active ? "rgba(0,232,122,0.15)" : "rgba(255,255,255,0.04)",
                        color: active ? "#00e87a" : "#eeeef5",
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      <FontAwesomeIcon icon={opt.icon} style={{ width: 12, height: 12 }} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="field-label">Notes</label>
              <input name="notes" className="input" defaultValue={game.notes ?? ""} />
            </div>
          </div>
          {error && <p className="mt-2 text-sm" style={{ color: "var(--color-danger-400)" }}>⚠ {error}</p>}
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--color-text-brand)", color: "#000",
                fontFamily: "var(--font-display)", fontSize: "0.875rem", letterSpacing: "0.05em",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 13, height: 13 }} />
                : <FontAwesomeIcon icon={faCheck} style={{ width: 13, height: 13 }} />
              }
              SAVE
            </button>
            <button type="button" onClick={() => setEditing(false)}
              style={{ background: "rgba(255,255,255,0.06)", color: "#eeeef5", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] p-5 transition-colors"
      style={{
        background: "var(--color-surface-card)",
        border: `1px solid ${isLive ? "rgba(255,61,61,0.3)" : "var(--color-border-subtle)"}`,
        marginBottom: 12,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className="hidden shrink-0 flex-col items-center rounded-lg px-3 py-2 text-center sm:flex"
          style={{ background: "rgba(255,255,255,0.04)", minWidth: 56 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900,
            color: "var(--color-text-primary)", lineHeight: 1 }}>
            {new Date(game.gameDate).getDate()}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            {new Date(game.gameDate).toLocaleDateString("en-US", { month: "short" })}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Status badge */}
            <span className="rounded px-2 py-0.5 text-xs font-bold"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`,
                fontFamily: "var(--font-display)", letterSpacing: "0.08em",
                animation: isLive ? "pulse 1.5s ease-in-out infinite" : "none" }}>
              {isLive && "● "}{status.label}
            </span>
            {/* Home/Away */}
            <span className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              <FontAwesomeIcon icon={game.isHome === null ? faQuestion : game.isHome ? faHome : faPlaneUp} style={{ width: 10, height: 10 }} />
              {game.isHome === null ? "TBD" : game.isHome ? "Home" : "Away"}
            </span>
          </div>

          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem",
            color: "var(--color-text-primary)", margin: "0 0 4px" }}>
            vs {game.opponent}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <FontAwesomeIcon icon={faClock} style={{ width: 10, height: 10 }} />
              {formatDate(game.gameDate)}{time && ` · ${time}`}
            </span>
            {game.location && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <FontAwesomeIcon icon={faLocationDot} style={{ width: 10, height: 10 }} />
                {game.location}
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {game.totalInnings} innings
            </span>
          </div>

          {game.notes && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>{game.notes}</p>
          )}
        </div>

        {/* Score / Actions */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          {/* Final score */}
          {isFinal && (
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 900,
                  color: won ? "#00e87a" : lost ? "#ff3d3d" : "#eeeef5", lineHeight: 1 }}>
                  {game.teamRuns}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700,
                  letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  {teamName.split(" ")[0]}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1rem",
                color: "var(--color-text-muted)" }}>–</div>
              <div className="text-center">
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 900,
                  color: lost ? "#00e87a" : won ? "#ff3d3d" : "#eeeef5", lineHeight: 1 }}>
                  {game.opponentRuns}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700,
                  letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  {game.opponent.split(" ")[0]}
                </div>
              </div>
            </div>
          )}

          {/* Go Live button */}
          {(game.status === "SCHEDULED" || game.status === "IN_PROGRESS") && (
            <>
              {pickingHomeAway && (
                <div style={{
                  position: "fixed", inset: 0, zIndex: 200,
                  background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
                }}>
                  <div style={{
                    background: "var(--color-surface-card)", borderRadius: 16,
                    border: "1px solid var(--color-border-default)",
                    padding: 32, maxWidth: 360, width: "100%",
                  }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800,
                      fontSize: "1.3rem", color: "#eeeef5", marginBottom: 6 }}>
                      Home or Away?
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)", marginBottom: 20 }}>
                      vs {game.opponent} — pick your side before going live.
                    </p>
                    <div className="flex gap-3">
                      {([
                        { val: true,  label: "We're Home", icon: faHome    },
                        { val: false, label: "We're Away", icon: faPlaneUp },
                      ] as const).map((opt) => (
                        <button key={String(opt.val)} type="button"
                          disabled={pickLoading}
                          onClick={async () => {
                            setPickLoading(true);
                            await setGameHomeAway(game.id, opt.val);
                            router.push(`/scorebook/${game.id}`);
                          }}
                          style={{
                            flex: 1, padding: "14px 12px", borderRadius: 10,
                            border: "1px solid rgba(0,232,122,0.3)",
                            background: "rgba(0,232,122,0.1)", color: "#00e87a",
                            fontFamily: "var(--font-display)", fontWeight: 800,
                            fontSize: "1rem", cursor: "pointer", letterSpacing: "0.04em",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            opacity: pickLoading ? 0.6 : 1,
                          }}>
                          <FontAwesomeIcon icon={opt.icon} style={{ width: 16, height: 16 }} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPickingHomeAway(false)}
                      style={{ marginTop: 16, width: "100%", background: "none",
                        border: "none", color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem",
                        cursor: "pointer", padding: "8px 0" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {game.isHome === null && !isLive ? (
                <button onClick={() => setPickingHomeAway(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "var(--color-text-brand)", color: "#000",
                    fontFamily: "var(--font-display)", fontSize: "0.875rem",
                    fontWeight: 800, letterSpacing: "0.05em",
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}>
                  <FontAwesomeIcon icon={faBolt} style={{ width: 12, height: 12 }} />
                  GO LIVE
                </button>
              ) : (
                <Link href={`/scorebook/${game.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: isLive ? "var(--color-danger-500)" : "var(--color-text-brand)",
                    color: isLive ? "#fff" : "#000",
                    fontFamily: "var(--font-display)", fontSize: "0.875rem",
                    fontWeight: 800, letterSpacing: "0.05em",
                    padding: "8px 16px", borderRadius: 8, textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}>
                  <FontAwesomeIcon icon={faBolt} style={{ width: 12, height: 12 }} />
                  {isLive ? "CONTINUE" : "GO LIVE"}
                </Link>
              )}
            </>
          )}

          {/* Edit / Delete / Log Score */}
          <div className="flex items-center gap-1">
            {!isFinal && (
              <button onClick={() => { setLoggingScore(true); setLogTeamRuns(0); setLogOppRuns(0); setLogError(""); }} title="Log score"
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(238,238,245,0.4)" }}>
                <FontAwesomeIcon icon={faClipboard} style={{ width: 13, height: 13 }} />
              </button>
            )}
            <button onClick={() => setEditing(true)} title="Edit"
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(238,238,245,0.4)" }}>
              <FontAwesomeIcon icon={faPencil} style={{ width: 13, height: 13 }} />
            </button>
            {confirming ? (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#ff3d3d" }}>Sure?</span>
                <button onClick={() => deleteGame(game.id)}
                  className="rounded px-2 py-1 text-xs font-bold"
                  style={{ background: "#e02020", color: "#fff", border: "none", cursor: "pointer" }}>
                  Yes
                </button>
                <button onClick={() => setConfirming(false)}
                  className="rounded px-2 py-1 text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#eeeef5", border: "none", cursor: "pointer" }}>
                  No
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} title="Delete"
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(238,238,245,0.4)" }}>
                <FontAwesomeIcon icon={faTrash} style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
