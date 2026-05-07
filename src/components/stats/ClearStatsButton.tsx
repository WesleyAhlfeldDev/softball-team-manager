"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { clearStats } from "@/server/actions/seasons";

export function ClearStatsButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await clearStats();
      if (result?.error) alert(result.error);
      setConfirming(false);
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span style={{ fontSize: "0.8rem", color: "#ff3d3d", fontFamily: "var(--font-body)" }}>
          Delete all stats?
        </span>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded-lg px-3 py-2 font-bold transition-opacity hover:opacity-80"
          style={{
            background: "#e02020",
            color: "#fff",
            border: "none",
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            letterSpacing: "0.05em",
            cursor: isPending ? "default" : "pointer",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Clearing…" : "Yes, clear"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg px-3 py-2 font-bold transition-opacity hover:opacity-80"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#eeeef5",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-opacity hover:opacity-80"
      style={{
        background: "rgba(255,61,61,0.1)",
        border: "1px solid rgba(255,61,61,0.25)",
        color: "#ff3d3d",
        fontFamily: "var(--font-display)",
        fontSize: "0.85rem",
        letterSpacing: "0.05em",
        cursor: "pointer",
      }}
    >
      <FontAwesomeIcon icon={faTrash} style={{ width: 13, height: 13 }} />
      CLEAR STATS
    </button>
  );
}
