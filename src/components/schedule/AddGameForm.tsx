"use client";

import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faCheck, faXmark, faSpinner,
  faLocationDot, faHome, faPlaneUp, faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { addGame } from "@/server/actions/games";

export function AddGameForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [isHome, setIsHome]   = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("isHome", isHome === null ? "null" : String(isHome));
    const result = await addGame(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
      setIsHome(null);
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-text-brand)", color: "#000",
          fontFamily: "var(--font-display)", fontSize: "0.9rem",
          letterSpacing: "0.05em", border: "none", cursor: "pointer",
        }}>
        <FontAwesomeIcon icon={faPlus} style={{ width: 12, height: 12 }} />
        ADD GAME
      </button>
    );
  }

  const locationOptions = [
    { val: true,  label: "Home", icon: faHome     },
    { val: false, label: "Away", icon: faPlaneUp  },
    { val: null,  label: "TBD",  icon: faQuestion },
  ] as const;

  return (
    <div className="mb-6 rounded-[14px] p-6"
      style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-brand)" }}>
      <div className="mb-5 flex items-center justify-between">
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "1.2rem", color: "var(--color-text-primary)", margin: 0 }}>
          Add Game
        </h3>
        <button onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
          <FontAwesomeIcon icon={faXmark} style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="md:col-span-2">
            <label className="field-label" htmlFor="opponent">Opponent</label>
            <input id="opponent" name="opponent" className="input"
              placeholder="e.g. Diamond Kings" required />
          </div>

          <div>
            <label className="field-label" htmlFor="gameDate">Date</label>
            <input id="gameDate" name="gameDate" type="date" className="input" required />
          </div>

          <div>
            <label className="field-label" htmlFor="gameTime">Time (optional)</label>
            <input id="gameTime" name="gameTime" type="time" className="input" />
          </div>

          <div>
            <label className="field-label" htmlFor="location">
              <FontAwesomeIcon icon={faLocationDot} style={{ width: 10, height: 10, marginRight: 4 }} />
              Location
            </label>
            <input id="location" name="location" className="input"
              placeholder="e.g. Riverside Park — Field 3" />
          </div>

          <div>
            <label className="field-label" htmlFor="totalInnings">Innings</label>
            <select id="totalInnings" name="totalInnings" className="input"
              style={{ cursor: "pointer", background: "var(--color-surface-card2)", color: "#eeeef5" }}>
              {[5, 6, 7, 9].map((n) => (
                <option key={n} value={n} style={{ background: "#111125", color: "#eeeef5" }}>
                  {n} innings{n === 7 ? " (standard)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Home / Away / TBD */}
          <div className="md:col-span-2">
            <div className="field-label mb-2">Game Location</div>
            <div className="flex gap-2">
              {locationOptions.map((opt) => {
                const active = isHome === opt.val;
                return (
                  <button key={String(opt.val)} type="button" onClick={() => setIsHome(opt.val)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${active ? "rgba(0,232,122,0.5)" : "rgba(255,255,255,0.18)"}`,
                      background: active ? "rgba(0,232,122,0.15)" : "rgba(255,255,255,0.04)",
                      color: active ? "#00e87a" : "#eeeef5",
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.15s",
                    }}>
                    <FontAwesomeIcon icon={opt.icon} style={{ width: 13, height: 13 }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {isHome === null && (
              <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)", marginTop: 6 }}>
                You'll choose home or away when you go live with the game.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="field-label" htmlFor="notes">Notes (optional)</label>
            <input id="notes" name="notes" className="input"
              placeholder="e.g. Double header, playoffs" />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-danger-400)" }}>⚠ {error}</p>
        )}

        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--color-text-brand)", color: "#000",
              fontFamily: "var(--font-display)", fontSize: "0.9rem",
              letterSpacing: "0.05em", border: "none", borderRadius: 8,
              padding: "10px 20px", fontWeight: 700, cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}>
            {loading
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 14, height: 14 }} />
              : <FontAwesomeIcon icon={faCheck} style={{ width: 14, height: 14 }} />
            }
            ADD GAME
          </button>
          <button type="button" onClick={() => setOpen(false)}
            style={{
              background: "rgba(255,255,255,0.06)", color: "#eeeef5",
              border: "none", borderRadius: 8, padding: "10px 18px",
              fontFamily: "var(--font-body)", fontSize: "0.875rem", cursor: "pointer",
            }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
