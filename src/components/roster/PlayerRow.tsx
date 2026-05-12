"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faShirt } from "@fortawesome/free-solid-svg-icons";
import { togglePlayerActive, deletePlayer } from "@/server/actions/players";
import { PlayerForm } from "./PlayerForm";
import type { FieldingPosition, Gender } from "@prisma/client";

const POSITION_SHORT: Record<FieldingPosition, string> = {
  PITCHER: "P", CATCHER: "C", FIRST_BASE: "1B", SECOND_BASE: "2B",
  THIRD_BASE: "3B", SHORTSTOP: "SS", LEFT_FIELD: "LF", LEFT_CENTER_FIELD: "LCF",
  CENTER_FIELD: "CF", RIGHT_CENTER_FIELD: "RCF",
  RIGHT_FIELD: "RF", SHORT_FIELD: "SF", EXTRA_PLAYER: "EP", BENCH: "—", SIT: "SIT",
};

const GENDER_SHORT: Record<Gender, string> = {
  MALE: "M", FEMALE: "F", NON_BINARY: "NB", PREFER_NOT_TO_SAY: "—",
};

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string | null;
  gender: Gender | null;
  primaryPosition: FieldingPosition;
  positions: FieldingPosition[];
  isActive: boolean;
  notes: string | null;
  playerStats: { battingAvg: number | null; ops: number | null }[];
}

export function PlayerRow({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (editing) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-2">
          <PlayerForm player={player} onClose={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border-subtle)", opacity: player.isActive ? 1 : 0.45 }}>
      {/* Jersey */}
      <td className="px-4 py-3 text-center">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "#eeeef5" }}>
          {player.jerseyNumber ? `#${player.jerseyNumber}` : "—"}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#eeeef5", fontFamily: "var(--font-body)" }}>
            {player.firstName} {player.lastName}
          </span>
          {!player.isActive && (
            <span className="rounded px-2 py-0.5 text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(238,238,245,0.4)" }}>
              INACTIVE
            </span>
          )}
        </div>
        {player.notes && (
          <p className="mt-0.5 text-xs" style={{ color: "rgba(238,238,245,0.4)" }}>{player.notes}</p>
        )}
      </td>

      {/* Gender */}
      <td className="px-4 py-3 text-center">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#eeeef5" }}>
          {player.gender ? GENDER_SHORT[player.gender] : "—"}
        </span>
      </td>

      {/* Positions */}
      <td className="px-4 py-3" style={{ maxWidth: 160 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, auto)", gap: 4 }}>
          {(player.positions ?? []).length > 0
            ? (player.positions ?? []).map((pos) => (
                <span
                  key={pos}
                  className="rounded px-2 py-0.5 text-xs font-bold"
                  style={{
                    background: pos === player.primaryPosition
                      ? "rgba(0,232,122,0.15)"
                      : "rgba(255,255,255,0.08)",
                    color: pos === player.primaryPosition ? "#00e87a" : "#eeeef5",
                    fontFamily: "var(--font-mono)",
                    border: `1px solid ${pos === player.primaryPosition ? "rgba(0,232,122,0.3)" : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  {POSITION_SHORT[pos]}
                </span>
              ))
            : <span style={{ color: "rgba(238,238,245,0.4)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>—</span>
          }
        </div>
      </td>

      {/* AVG */}
      <td className="px-4 py-3 text-center">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: player.playerStats[0]?.battingAvg ? "#00e87a" : "#eeeef5" }}>
          {player.playerStats[0]?.battingAvg
            ? `.${String(Math.round(player.playerStats[0].battingAvg * 1000)).padStart(3, "0")}`
            : ".000"}
        </span>
      </td>

      {/* OPS */}
      <td className="px-4 py-3 text-center">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: player.playerStats[0]?.ops ? "#00e87a" : "#eeeef5" }}>
          {player.playerStats[0]?.ops?.toFixed(3) ?? ".000"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => togglePlayerActive(player.id, !player.isActive)} title={player.isActive ? "Set inactive" : "Set active"}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ background: "none", border: "none", cursor: "pointer", color: player.isActive ? "#00e87a" : "rgba(238,238,245,0.4)" }}>
            <FontAwesomeIcon icon={faShirt} style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={() => setEditing(true)} title="Edit player"
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(238,238,245,0.4)" }}>
            <FontAwesomeIcon icon={faPencil} style={{ width: 14, height: 14 }} />
          </button>
          {confirming ? (
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: "#ff3d3d" }}>Sure?</span>
              <button onClick={() => deletePlayer(player.id)}
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
            <button onClick={() => setConfirming(true)} title="Delete player"
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(238,238,245,0.4)" }}>
              <FontAwesomeIcon icon={faTrash} style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
