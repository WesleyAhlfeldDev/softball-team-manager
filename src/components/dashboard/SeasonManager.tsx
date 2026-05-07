"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays, faChevronDown, faChevronUp,
  faCheck, faPlus, faSpinner, faFlagCheckered, faTrophy, faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { createSeason, setActiveSeason, finishSeason, resetSeason } from "@/server/actions/seasons";

interface Season {
  id: string;
  name: string;
  isActive: boolean;
  isFinished: boolean;
  createdAt: Date;
}

interface SeasonManagerProps {
  seasons: Season[];
}

export function SeasonManager({ seasons }: SeasonManagerProps) {
  const [open, setOpen]               = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmReset, setConfirmReset]   = useState(false);
  const [error, setError]             = useState("");
  const [isPending, startTransition]  = useTransition();

  const activeSeason = seasons.find((s) => s.isActive);
  const pastSeasons  = seasons.filter((s) => !s.isActive);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createSeason(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
      }
    });
  };

  const handleSwitch = (seasonId: string) => {
    startTransition(async () => {
      await setActiveSeason(seasonId);
    });
  };

  const handleFinish = () => {
    setConfirmFinish(false);
    startTransition(async () => {
      const result = await finishSeason();
      if (result?.error) setError(result.error);
    });
  };

  const handleReset = () => {
    setConfirmReset(false);
    startTransition(async () => {
      const result = await resetSeason();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="card mb-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "rgba(91,143,255,0.12)", border: "1px solid rgba(91,143,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FontAwesomeIcon icon={faCalendarDays}
              style={{ width: 16, height: 16, color: "#5b8fff" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "1.1rem", color: "#eeeef5", textAlign: "left" }}>
              Seasons
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)", textAlign: "left", marginTop: 2 }}>
              {activeSeason ? `Active: ${activeSeason.name}` : "No active season"}
              {pastSeasons.length > 0 && ` · ${pastSeasons.length} past`}
            </div>
          </div>
        </div>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown}
          style={{ width: 14, height: 14, color: "var(--color-text-muted)" }} />
      </button>

      {open && (
        <div className="mt-5">
          {/* Active season */}
          {activeSeason && (
            <div className="mb-4 rounded-lg px-4 py-3"
              style={{ background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: "1rem", color: "#eeeef5" }}>
                    {activeSeason.name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#00e87a", fontFamily: "var(--font-body)",
                    marginTop: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Active Season
                  </div>
                </div>
                <FontAwesomeIcon icon={faCheck}
                  style={{ width: 16, height: 16, color: "#00e87a" }} />
              </div>

              {/* Finish season */}
              <div className="mt-3 border-t pt-3" style={{ borderColor: "rgba(0,232,122,0.2)" }}>
                {confirmFinish ? (
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)" }}>
                      End this season for good?
                    </span>
                    <button
                      type="button"
                      onClick={handleFinish}
                      disabled={isPending}
                      className="rounded-lg px-3 py-1 text-xs font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{
                        background: "#ff3d3d", color: "#fff",
                        border: "none", cursor: "pointer",
                        fontFamily: "var(--font-display)", letterSpacing: "0.05em",
                      }}
                    >
                      {isPending
                        ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 11, height: 11 }} />
                        : "CONFIRM"
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmFinish(false)}
                      className="rounded-lg px-3 py-1 text-xs transition-opacity hover:opacity-80"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "var(--color-text-muted)", cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmFinish(true)}
                    disabled={isPending}
                    className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70 disabled:opacity-50"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-display)", letterSpacing: "0.05em",
                      fontSize: "0.75rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faFlagCheckered} style={{ width: 12, height: 12 }} />
                    FINISH SEASON
                  </button>
                )}
                {error && (
                  <p className="mt-2 text-xs font-medium" style={{ color: "var(--color-danger-400)" }}>
                    ⚠ {error}
                  </p>
                )}
              </div>

              {/* Reset season */}
              <div className="mt-2 border-t pt-3" style={{ borderColor: "rgba(0,232,122,0.2)" }}>
                {confirmReset ? (
                  <div className="flex flex-col gap-2">
                    <p style={{ fontSize: "0.78rem", color: "#ff3d3d",
                      fontFamily: "var(--font-body)", margin: 0 }}>
                      ⚠ This will permanently delete all games and stats for this season. This cannot be undone.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isPending}
                        className="rounded-lg px-3 py-1 text-xs font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                          background: "#ff3d3d", color: "#fff",
                          border: "none", cursor: "pointer",
                          fontFamily: "var(--font-display)", letterSpacing: "0.05em",
                        }}
                      >
                        {isPending
                          ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 11, height: 11 }} />
                          : "YES, RESET"
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="rounded-lg px-3 py-1 text-xs transition-opacity hover:opacity-80"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "var(--color-text-muted)", cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setConfirmReset(true); setConfirmFinish(false); }}
                    disabled={isPending}
                    className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70 disabled:opacity-50"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-display)", letterSpacing: "0.05em",
                      fontSize: "0.75rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faRotateLeft} style={{ width: 12, height: 12 }} />
                    RESET SEASON
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Past seasons */}
          {pastSeasons.length > 0 && (
            <div className="mb-4">
              <div className="eyebrow mb-3">Past Seasons</div>
              <div className="flex flex-col gap-2">
                {pastSeasons.map((season) => (
                  <div key={season.id}
                    className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}>
                    <div className="flex items-center gap-3">
                      {season.isFinished && (
                        <FontAwesomeIcon icon={faTrophy}
                          style={{ width: 13, height: 13, color: "#f59e0b" }} />
                      )}
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600,
                          fontSize: "0.95rem", color: "#eeeef5" }}>
                          {season.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)",
                          fontFamily: "var(--font-body)", marginTop: 2 }}>
                          {season.isFinished ? "Completed · " : ""}
                          {new Date(season.createdAt).toLocaleDateString("en-US", {
                            month: "short", year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSwitch(season.id)}
                      disabled={isPending}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#eeeef5", fontFamily: "var(--font-display)",
                        letterSpacing: "0.05em", cursor: "pointer",
                      }}
                    >
                      {isPending ? "..." : "SWITCH"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New season form / button */}
          {showForm ? (
            <form onSubmit={handleCreate}>
              <div className="flex gap-2">
                <input
                  name="name"
                  className="input flex-1"
                  placeholder="e.g. Fall 2026"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    background: "var(--color-text-brand)", color: "#000",
                    fontFamily: "var(--font-display)", fontSize: "0.85rem",
                    letterSpacing: "0.05em", border: "none", cursor: "pointer",
                  }}
                >
                  {isPending
                    ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 13, height: 13 }} />
                    : "CREATE"
                  }
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="rounded-lg px-3 py-2 text-sm transition-opacity hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--color-text-muted)", cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Cancel
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-danger-400)" }}>
                  ⚠ {error}
                </p>
              )}
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(0,232,122,0.1)",
                border: "1px solid rgba(0,232,122,0.25)",
                color: "#00e87a",
                fontFamily: "var(--font-display)", fontSize: "0.85rem",
                letterSpacing: "0.05em", cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13 }} />
              NEW SEASON
            </button>
          )}
        </div>
      )}
    </div>
  );
}
