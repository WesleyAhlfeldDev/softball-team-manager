"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear, faCheck, faSpinner, faChevronDown,
  faChevronUp, faBaseballBatBall, faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { saveLeagueRules } from "@/server/actions/league";
import {
  DEFAULT_LEAGUE_RULES,
  type LeagueRules,
  type HrOverLimitResult,
} from "@/types/league-rules";

const HR_RESULTS: { value: HrOverLimitResult; label: string }[] = [
  { value: "OUT",    label: "Out"    },
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "TRIPLE", label: "Triple" },
];

interface LeagueSettingsProps {
  initialRules: LeagueRules;
}

// ── Helpers ────────────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <span style={{ fontSize: "0.875rem", color: "#eeeef5", fontFamily: "var(--font-body)" }}>
        {label}
      </span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: value ? "var(--color-text-brand)" : "rgba(255,255,255,0.12)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2,
        left: value ? 22 : 2,
        width: 20, height: 20, borderRadius: "50%",
        background: value ? "#000" : "rgba(238,238,245,0.5)",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

function NumberInput({
  value, onChange, min = 0, max = 99, placeholder = "—", nullable = false,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number; max?: number; placeholder?: string; nullable?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {nullable && (
        <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={value !== null}
            onChange={(e) => onChange(e.target.checked ? min : null)}
            style={{ accentColor: "var(--color-text-brand)", width: 14, height: 14 }} />
          Limit
        </label>
      )}
      {value !== null && (
        <input
          type="number" min={min} max={max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder={placeholder}
          style={{
            width: 64, background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
            padding: "4px 8px", color: "#eeeef5",
            fontFamily: "var(--font-mono)", fontSize: "0.875rem",
            textAlign: "center", outline: "none",
          }}
        />
      )}
      {value === null && nullable && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Unlimited
        </span>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export function LeagueSettings({ initialRules }: LeagueSettingsProps) {
  const [rules, setRules]     = useState<LeagueRules>(initialRules);
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const update = (path: string, value: unknown) => {
    setRules((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as LeagueRules;
      const keys = path.split(".");
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]!] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]!] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await saveLeagueRules(rules);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card mb-6">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faGear}
            style={{ width: 16, height: 16, color: "var(--color-text-brand)" }} />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "1.1rem", color: "#eeeef5", textAlign: "left" }}>
              League Rules
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)", textAlign: "left", marginTop: 2 }}>
              {rules.isCoed ? "Co-ed" : "Non co-ed"} ·{" "}
              {rules.hrRules.maxHrsPerGame !== null
                ? `Max ${rules.hrRules.maxHrsPerGame} HRs/game`
                : "Unlimited HRs"} ·{" "}
              {rules.general.inningsPerGame} innings
            </div>
          </div>
        </div>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown}
          style={{ width: 14, height: 14, color: "var(--color-text-muted)" }} />
      </button>

      {/* Expandable body */}
      {open && (
        <div className="mt-5">

          {/* ── Co-ed ──────────────────────────────────────── */}
          <div className="mb-5">
            <div className="eyebrow mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} style={{ width: 11, height: 11 }} />
              Co-ed Settings
            </div>

            <Row label="Co-ed league">
              <Toggle value={rules.isCoed} onChange={(v) => update("isCoed", v)} />
            </Row>

            {rules.isCoed && (
              <>
                <Row label="Minimum females on field per inning">
                  <NumberInput
                    value={rules.coed.minFemalesOnField}
                    onChange={(v) => update("coed.minFemalesOnField", v ?? 0)}
                    min={0} max={11}
                  />
                </Row>

                <Row label="Max consecutive male batters in order">
                  <NumberInput
                    value={rules.coed.maxConsecutiveMaleBatters}
                    onChange={(v) => update("coed.maxConsecutiveMaleBatters", v ?? 0)}
                    min={1} max={11}
                  />
                </Row>

                <Row label="Must have ≥1 female in infield">
                  <Toggle
                    value={rules.coed.requireFemaleInfield}
                    onChange={(v) => update("coed.requireFemaleInfield", v)}
                  />
                </Row>

                <Row label="Must have ≥1 female in outfield">
                  <Toggle
                    value={rules.coed.requireFemaleOutfield}
                    onChange={(v) => update("coed.requireFemaleOutfield", v)}
                  />
                </Row>
              </>
            )}
          </div>

          {/* ── Home Run Rules ──────────────────────────────── */}
          <div className="mb-5">
            <div className="eyebrow mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBaseballBatBall} style={{ width: 11, height: 11 }} />
              Home Run Rules
            </div>

            <Row label="Max over-the-fence HRs per game">
              <NumberInput
                value={rules.hrRules.maxHrsPerGame}
                onChange={(v) => update("hrRules.maxHrsPerGame", v)}
                min={0} max={99} nullable
              />
            </Row>

            {rules.hrRules.maxHrsPerGame !== null && (
              <>
                <Row label="Result when HR limit is exceeded">
                  <select
                    value={rules.hrRules.hrOverLimitResult}
                    onChange={(e) => update("hrRules.hrOverLimitResult", e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#eeeef5", borderRadius: 6, padding: "4px 10px",
                      fontFamily: "var(--font-body)", fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    {HR_RESULTS.map((r) => (
                      <option key={r.value} value={r.value}
                        style={{ background: "#111125", color: "#eeeef5" }}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Row>

                <Row label="Separate HR limit for male/female batters">
                  <Toggle
                    value={rules.hrRules.separateLimitMale}
                    onChange={(v) => update("hrRules.separateLimitMale", v)}
                  />
                </Row>

                {rules.hrRules.separateLimitMale && (
                  <>
                    <Row label="Max HRs per game — male batters">
                      <NumberInput
                        value={rules.hrRules.maxHrsMale}
                        onChange={(v) => update("hrRules.maxHrsMale", v)}
                        min={0} max={99} nullable
                      />
                    </Row>
                    <Row label="Max HRs per game — female batters">
                      <NumberInput
                        value={rules.hrRules.maxHrsFemale}
                        onChange={(v) => update("hrRules.maxHrsFemale", v)}
                        min={0} max={99} nullable
                      />
                    </Row>
                  </>
                )}
              </>
            )}
          </div>

          {/* ── General Rules ───────────────────────────────── */}
          <div className="mb-5">
            <div className="eyebrow mb-3">General Rules</div>

            <Row label="Innings per game">
              <NumberInput
                value={rules.general.inningsPerGame}
                onChange={(v) => update("general.inningsPerGame", v ?? 7)}
                min={1} max={15}
              />
            </Row>

            <Row label="Mercy run limit">
              <NumberInput
                value={rules.general.mercyRunLimit}
                onChange={(v) => update("general.mercyRunLimit", v)}
                min={1} max={99} nullable
              />
            </Row>

            {rules.general.mercyRunLimit !== null && (
              <Row label="Mercy rule starts after inning #">
                <NumberInput
                  value={rules.general.mercyInning}
                  onChange={(v) => update("general.mercyInning", v)}
                  min={1} max={14} nullable
                />
              </Row>
            )}

            <Row label="Allow extra innings if tied">
              <Toggle
                value={rules.general.extraInnings}
                onChange={(v) => update("general.extraInnings", v)}
              />
            </Row>

            <Row label="Time limit (minutes)">
              <NumberInput
                value={rules.general.timeLimit}
                onChange={(v) => update("general.timeLimit", v)}
                min={30} max={180} nullable
              />
            </Row>

            <Row label="Base path (feet)">
              <select
                value={rules.general.basePathFeet}
                onChange={(e) => update("general.basePathFeet", Number(e.target.value))}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#eeeef5", borderRadius: 6, padding: "4px 10px",
                  fontFamily: "var(--font-body)", fontSize: "0.875rem", cursor: "pointer",
                }}
              >
                {[60, 65, 70, 75, 80, 90].map((n) => (
                  <option key={n} value={n} style={{ background: "#111125", color: "#eeeef5" }}>
                    {n} ft
                  </option>
                ))}
              </select>
            </Row>

            <Row label="Pitching arc">
              <input
                value={rules.general.pitchingArc}
                onChange={(e) => update("general.pitchingArc", e.target.value)}
                placeholder="e.g. 6–12 feet"
                style={{
                  width: 120, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6, padding: "4px 8px", color: "#eeeef5",
                  fontFamily: "var(--font-body)", fontSize: "0.875rem", outline: "none",
                }}
              />
            </Row>

            <Row label="Outfield fence distance (feet)">
              <NumberInput
                value={rules.general.outfieldFence}
                onChange={(v) => update("general.outfieldFence", v)}
                min={150} max={400} nullable
              />
            </Row>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                background: "var(--color-text-brand)", color: "#000",
                fontFamily: "var(--font-display)", fontSize: "0.9rem",
                letterSpacing: "0.05em", border: "none", cursor: "pointer",
              }}
            >
              {saving
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ width: 14, height: 14 }} />
                : <FontAwesomeIcon icon={faCheck} style={{ width: 14, height: 14 }} />
              }
              SAVE RULES
            </button>
            {saved && (
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-brand)",
                fontWeight: 600, fontFamily: "var(--font-body)" }}>
                ✓ Saved!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
