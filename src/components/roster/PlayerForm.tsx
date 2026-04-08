"use client";

import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCheck,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { addPlayer, updatePlayer } from "@/server/actions/players";
import type { FieldingPosition, Gender } from "@prisma/client";

const POSITIONS: { value: FieldingPosition; label: string; short: string }[] = [
  { value: "PITCHER",      label: "Pitcher",      short: "P"  },
  { value: "CATCHER",      label: "Catcher",      short: "C"  },
  { value: "FIRST_BASE",   label: "First Base",   short: "1B" },
  { value: "SECOND_BASE",  label: "Second Base",  short: "2B" },
  { value: "THIRD_BASE",   label: "Third Base",   short: "3B" },
  { value: "SHORTSTOP",    label: "Shortstop",    short: "SS" },
  { value: "LEFT_FIELD",          label: "Left Field",         short: "LF"  },
  { value: "LEFT_CENTER_FIELD",  label: "Left Center Field",  short: "LCF" },
  { value: "CENTER_FIELD",       label: "Center Field",       short: "CF"  },
  { value: "RIGHT_CENTER_FIELD", label: "Right Center Field", short: "RCF" },
  { value: "RIGHT_FIELD",        label: "Right Field",        short: "RF"  },
  { value: "SHORT_FIELD",        label: "Short Field",        short: "SF"  },
  { value: "EXTRA_PLAYER", label: "Extra Player", short: "EP" },
  { value: "BENCH",        label: "Bench Only",   short: "—"  },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE",              label: "Male"               },
  { value: "FEMALE",            label: "Female"             },
  { value: "NON_BINARY",        label: "Non-binary"         },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say"  },
];

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string | null;
  gender: Gender | null;
  primaryPosition: FieldingPosition;
  positions: FieldingPosition[];
  notes: string | null;
}

interface PlayerFormProps {
  player?: Player;
  onClose?: () => void;
}

export function PlayerForm({ player, onClose }: PlayerFormProps) {
  const isEditing = !!player;
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(isEditing);
  const [selectedPositions, setSelectedPositions] = useState<FieldingPosition[]>(
    player?.positions ?? []
  );
  const [primaryPosition, setPrimaryPosition] = useState<FieldingPosition>(
    player?.primaryPosition ?? "BENCH"
  );

  const togglePosition = (pos: FieldingPosition) => {
    setSelectedPositions((prev) => {
      const next = prev.includes(pos)
        ? prev.filter((p) => p !== pos)
        : [...prev, pos];
      if (next.length === 1 && next[0]) setPrimaryPosition(next[0]);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.delete("positions");
    selectedPositions.forEach((p) => formData.append("positions", p));
    formData.set("primaryPosition", primaryPosition);
    const result = isEditing
      ? await updatePlayer(player.id, formData)
      : await addPlayer(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
      setSelectedPositions([]);
      setPrimaryPosition("BENCH");
      if (isEditing && onClose) onClose();
      if (!isEditing) setOpen(false);
    }
  };

  if (!isEditing && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-text-brand)", color: "#000",
          fontFamily: "var(--font-display)", fontSize: "0.9rem",
          letterSpacing: "0.05em", border: "none", cursor: "pointer",
        }}
      >
        <FontAwesomeIcon icon={faPlus} style={{ width: 12, height: 12 }} />
        ADD PLAYER
      </button>
    );
  }

  return (
    <div
      className="mb-6 rounded-[14px] p-6"
      style={{
        background: "var(--color-surface-card)",
        border: "1px solid var(--color-border-brand)",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", color: "var(--color-text-primary)", margin: 0 }}>
          {isEditing ? "Edit Player" : "Add New Player"}
        </h3>
        <button onClick={isEditing ? onClose : () => setOpen(false)}
          style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
          <FontAwesomeIcon icon={faXmark} style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="firstName">First Name</label>
            <input id="firstName" name="firstName" className="input" placeholder="e.g. Marcus" defaultValue={player?.firstName} required />
          </div>
          <div>
            <label className="field-label" htmlFor="lastName">Last Name</label>
            <input id="lastName" name="lastName" className="input" placeholder="e.g. Johnson" defaultValue={player?.lastName} required />
          </div>
          <div>
            <label className="field-label" htmlFor="jerseyNumber">Jersey #</label>
            <input id="jerseyNumber" name="jerseyNumber" className="input" placeholder="e.g. 12" defaultValue={player?.jerseyNumber ?? ""} maxLength={4} />
          </div>
          <div>
            <label className="field-label" htmlFor="gender">Gender</label>
            <select
              id="gender" name="gender" className="input"
              defaultValue={player?.gender ?? ""}
              style={{ cursor: "pointer", color: "var(--color-text-primary)", background: "var(--color-surface-card2)" }}
            >
              <option value="" style={{ background: "#111125", color: "#eeeef5" }}>Select gender…</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value} style={{ background: "#111125", color: "#eeeef5" }}>{g.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="notes">Notes (optional)</label>
            <input id="notes" name="notes" className="input" placeholder="e.g. Lefty batter, strong arm" defaultValue={player?.notes ?? ""} />
          </div>
        </div>

        {/* ── Position picker ──────────────────────────────── */}
        <div className="mt-5">
          <div className="field-label mb-3">Positions — tap all that apply</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
            {POSITIONS.map((pos) => {
              const isSelected = selectedPositions.includes(pos.value);
              const isPrimary  = primaryPosition === pos.value && isSelected;
              return (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => togglePosition(pos.value)}
                  title={pos.label}
                  style={{
                    padding: "7px 4px",
                    borderRadius: 8,
                    border: `1px solid ${isSelected ? "rgba(0,232,122,0.5)" : "rgba(255,255,255,0.18)"}`,
                    background: isPrimary
                      ? "var(--color-text-brand)"
                      : isSelected
                      ? "rgba(0,232,122,0.15)"
                      : "rgba(255,255,255,0.06)",
                    color: isPrimary ? "#000" : isSelected ? "#00e87a" : "#eeeef5",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {pos.short}
                </button>
              );
            })}
          </div>
          {selectedPositions.length > 1 && (
            <div className="mt-4">
              <div className="field-label mb-2">Primary Position</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
                {selectedPositions.map((pos) => {
                  const p = POSITIONS.find((x) => x.value === pos);
                  const isPrimary = primaryPosition === pos;
                  return (
                    <button key={pos} type="button" onClick={() => setPrimaryPosition(pos)}
                      style={{
                        padding: "5px 14px", borderRadius: 8,
                        border: `1px solid ${isPrimary ? "rgba(0,232,122,0.5)" : "rgba(255,255,255,0.18)"}`,
                        background: isPrimary ? "var(--color-text-brand)" : "rgba(255,255,255,0.06)",
                        color: isPrimary ? "#000" : "#eeeef5",
                        fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                        fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {p?.short ?? pos}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                Solid green = primary. Tap to change.
              </p>
            </div>
          )}
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
              padding: "10px 20px", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 14, height: 14 }} />
              : <FontAwesomeIcon icon={faCheck} style={{ width: 14, height: 14 }} />
            }
            {isEditing ? "SAVE CHANGES" : "ADD PLAYER"}
          </button>
          <button type="button" onClick={isEditing ? onClose : () => setOpen(false)}
            style={{
              background: "rgba(255,255,255,0.06)", color: "#eeeef5",
              border: "none", borderRadius: 8, padding: "10px 18px",
              fontFamily: "var(--font-body)", fontSize: "0.875rem", cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
