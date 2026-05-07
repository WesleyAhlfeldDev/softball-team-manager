"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask } from "@fortawesome/free-solid-svg-icons";
import { seedRandomStats } from "@/server/actions/seasons";

export function GenerateTestDataButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await seedRandomStats();
      if (result?.error) {
        alert(result.error);
      }
      setConfirming(false);
    });
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p style={{ color: "rgba(238,238,245,0.6)", margin: 0, fontSize: "0.875rem" }}>
          This will overwrite any existing stats for all active players.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80"
            style={{
              background: "#00e87a",
              color: "#0a0a0f",
              border: "none",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Generating…" : "Yes, generate"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#eeeef5",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-opacity hover:opacity-80"
      style={{
        background: "rgba(0,232,122,0.1)",
        border: "1px solid rgba(0,232,122,0.25)",
        color: "#00e87a",
        fontFamily: "var(--font-display)",
        fontSize: "0.85rem",
        letterSpacing: "0.05em",
        cursor: "pointer",
      }}
    >
      <FontAwesomeIcon icon={faFlask} style={{ width: 13, height: 13 }} />
      GENERATE TEST DATA
    </button>
  );
}
