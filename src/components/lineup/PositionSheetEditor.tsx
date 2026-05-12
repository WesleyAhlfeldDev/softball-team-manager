"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { updateInningPositions } from "@/server/actions/lineup";
import type { FieldingPosition } from "@prisma/client";

const POS_OPTIONS: { value: FieldingPosition; short: string }[] = [
  { value: "PITCHER",            short: "P"   },
  { value: "CATCHER",            short: "C"   },
  { value: "FIRST_BASE",         short: "1B"  },
  { value: "SECOND_BASE",        short: "2B"  },
  { value: "THIRD_BASE",         short: "3B"  },
  { value: "SHORTSTOP",          short: "SS"  },
  { value: "LEFT_FIELD",         short: "LF"  },
  { value: "LEFT_CENTER_FIELD",  short: "LCF" },
  { value: "CENTER_FIELD",       short: "CF"  },
  { value: "RIGHT_CENTER_FIELD", short: "RCF" },
  { value: "RIGHT_FIELD",        short: "RF"  },
  { value: "SHORT_FIELD",        short: "SF"  },
  { value: "EXTRA_PLAYER",       short: "EP"  },
  { value: "BENCH",              short: "—"   },
  { value: "SIT",                short: "SIT" },
];

const INFIELD:  FieldingPosition[] = ["PITCHER","CATCHER","FIRST_BASE","SECOND_BASE","THIRD_BASE","SHORTSTOP"];
const OUTFIELD: FieldingPosition[] = ["LEFT_FIELD","LEFT_CENTER_FIELD","CENTER_FIELD","RIGHT_CENTER_FIELD","RIGHT_FIELD","SHORT_FIELD"];

function posColor(pos: FieldingPosition) {
  if (pos === "BENCH" || pos === "SIT") return null;
  if (INFIELD.includes(pos))  return "#5b8fff";
  if (OUTFIELD.includes(pos)) return "#00e87a";
  return "#c084fc";
}

export interface SheetSlot {
  playerId: string;
  battingOrder: number;
  fieldingPosition: FieldingPosition;
  inningPositions: Record<number, FieldingPosition>;
  player: {
    firstName: string;
    lastName: string;
    jerseyNumber: string | null;
    gender: string | null;
    positions: FieldingPosition[];
  };
}

interface Props {
  gameId: string;
  initialSlots: SheetSlot[];
  innings: number[];
  teamColor: string;
}

export function PositionSheetEditor({ gameId, initialSlots, innings, teamColor }: Props) {
  const [slots, setSlots]     = useState<SheetSlot[]>(initialSlots);
  const [dirty, setDirty]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const updateCell = (playerId: string, inning: number, pos: FieldingPosition) => {
    setSlots((prev) => prev.map((s) =>
      s.playerId === playerId
        ? { ...s, inningPositions: { ...s.inningPositions, [inning]: pos } }
        : s
    ));
    setDirty(true);
    setSavedMsg("");
  };

  const handleSave = async () => {
    setSaving(true);
    await updateInningPositions(
      gameId,
      slots.map((s) => ({
        playerId: s.playerId,
        battingOrder: s.battingOrder,
        fieldingPosition: s.fieldingPosition,
        inningPositions: s.inningPositions,
      }))
    );
    setSaving(false);
    setDirty(false);
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <>
      {/* Save bar */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            background: teamColor, color: "#000",
            fontFamily: "var(--font-display)", fontSize: "0.875rem",
            letterSpacing: "0.05em", border: "none",
            cursor: dirty && !saving ? "pointer" : "default",
          }}
        >
          {saving
            ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 13, height: 13 }} />
            : <FontAwesomeIcon icon={faCheck} style={{ width: 13, height: 13 }} />
          }
          SAVE CHANGES
        </button>
        {savedMsg && (
          <span style={{ fontSize: "0.8rem", color: teamColor,
            fontFamily: "var(--font-body)", fontWeight: 600 }}>
            {savedMsg}
          </span>
        )}
        {dirty && !savedMsg && (
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)" }}>
            Unsaved changes
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="card overflow-x-auto p-0">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border-subtle)",
              background: "rgba(255,255,255,0.02)" }}>
              <th style={TH}>#</th>
              <th style={{ ...TH, textAlign: "left", minWidth: 150 }}>Player</th>
              {innings.map((inn) => (
                <th key={inn} style={{ ...TH, minWidth: 76 }}>Inn {inn}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, index) => {
              const playerPositions = new Set(slot.player.positions ?? []);
              return (
                <tr key={slot.playerId}
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>

                  <td style={{ padding: "10px 12px", textAlign: "center",
                    fontFamily: "var(--font-display)", fontWeight: 900,
                    fontSize: "1.1rem", color: teamColor, width: 40 }}>
                    {index + 1}
                  </td>

                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#eeeef5" }}>
                      {slot.player.firstName} {slot.player.lastName}
                    </span>
                    {slot.player.jerseyNumber && (
                      <span style={{ marginLeft: 7, fontSize: "0.7rem",
                        color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                        #{slot.player.jerseyNumber}
                      </span>
                    )}
                    {slot.player.gender === "FEMALE" && (
                      <span style={{ marginLeft: 5, fontSize: "0.65rem",
                        color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>F</span>
                    )}
                  </td>

                  {innings.map((inn) => {
                    const pos: FieldingPosition =
                      slot.inningPositions[inn] ?? slot.fieldingPosition;
                    const color = posColor(pos);
                    return (
                      <td key={inn} style={{ padding: "6px 5px", textAlign: "center" }}>
                        <select
                          value={pos}
                          onChange={(e) => updateCell(slot.playerId, inn, e.target.value as FieldingPosition)}
                          style={{
                            background: color ? `${color}18` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${color ? `${color}44` : "rgba(255,255,255,0.1)"}`,
                            color: color ?? "rgba(238,238,245,0.3)",
                            borderRadius: 6, padding: "4px 3px",
                            fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                            fontWeight: 700, cursor: "pointer", width: 66,
                            textAlign: "center",
                          }}
                        >
                          {POS_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}
                              style={{
                                background: "#111125",
                                color: playerPositions.has(p.value)
                                  ? "#eeeef5"
                                  : "rgba(238,238,245,0.45)",
                              }}>
                              {p.short}{p.value === "SIT" ? " (sit)" : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-5">
        {[
          { label: "Infield",      color: "#5b8fff" },
          { label: "Outfield",     color: "#00e87a" },
          { label: "Extra Player", color: "#c084fc" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

const TH: React.CSSProperties = {
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(238,238,245,0.4)",
  textAlign: "center",
};
