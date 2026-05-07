"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { resetSeason } from "@/server/actions/seasons";

export function ResetSeasonButton() {
  const [confirm, setConfirm]        = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    setConfirm(false);
    startTransition(async () => {
      await resetSeason();
    });
  };

  return (
    <div className="card mb-6"
      style={{ borderColor: "rgba(255,61,61,0.25)", background: "rgba(255,61,61,0.04)" }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="eyebrow mb-1" style={{ color: "#ff3d3d" }}>Reset Season</div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
            Permanently deletes all game results and stats for this season. The season stays active so you can start fresh. <strong style={{ color: "#ff3d3d" }}>This cannot be undone.</strong>
          </p>
        </div>

        {confirm ? (
          <div className="flex shrink-0 flex-col gap-2">
            <p style={{ fontSize: "0.78rem", color: "#ff3d3d",
              fontFamily: "var(--font-body)", margin: 0, whiteSpace: "nowrap" }}>
              All games and stats will be deleted.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{
                  background: "#ff3d3d", color: "#fff",
                  fontFamily: "var(--font-display)", fontSize: "0.85rem",
                  letterSpacing: "0.05em", border: "none", cursor: "pointer",
                }}
              >
                {isPending
                  ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 13, height: 13 }} />
                  : "YES, RESET"
                }
              </button>
              <button
                type="button"
                onClick={() => setConfirm(false)}
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
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={isPending}
            className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              background: "rgba(255,61,61,0.15)",
              border: "1px solid rgba(255,61,61,0.35)",
              color: "#ff3d3d",
              fontFamily: "var(--font-display)", fontSize: "0.9rem",
              letterSpacing: "0.05em", cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faRotateLeft} style={{ width: 14, height: 14 }} />
            RESET SEASON
          </button>
        )}
      </div>
    </div>
  );
}
