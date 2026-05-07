"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlagCheckered, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { finishSeason } from "@/server/actions/seasons";

export function FinishSeasonButton() {
  const [confirm, setConfirm]        = useState(false);
  const [error, setError]            = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFinish = () => {
    setConfirm(false);
    startTransition(async () => {
      const result = await finishSeason();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="card mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
      <div>
        <div className="eyebrow mb-1" style={{ color: "#f59e0b" }}>Season Complete</div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
          All games are finished. Ready to wrap up this season?
        </p>
      </div>

      {confirm ? (
        <div className="flex shrink-0 items-center gap-2">
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
            Are you sure?
          </span>
          <button
            type="button"
            onClick={handleFinish}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              background: "#f59e0b", color: "#000",
              fontFamily: "var(--font-display)", fontSize: "0.85rem",
              letterSpacing: "0.05em", border: "none", cursor: "pointer",
            }}
          >
            {isPending
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 13, height: 13 }} />
              : "CONFIRM"
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
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          disabled={isPending}
          className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            background: "#f59e0b", color: "#000",
            fontFamily: "var(--font-display)", fontSize: "0.9rem",
            letterSpacing: "0.05em", border: "none", cursor: "pointer",
          }}
        >
          <FontAwesomeIcon icon={faFlagCheckered} style={{ width: 14, height: 14 }} />
          FINISH SEASON
        </button>
      )}

      {error && (
        <p className="text-sm font-medium" style={{ color: "var(--color-danger-400)" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
