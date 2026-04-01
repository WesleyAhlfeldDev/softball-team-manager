"use client";

import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved, faChevronDown, faChevronUp,
  faCheck, faSpinner, faUpload, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { saveTeamInfo } from "@/server/actions/team";

interface TeamInfoProps {
  initialData: {
    name: string;
    season: string;
    league: string | null;
    homeField: string | null;
    teamColor: string | null;
    logoUrl: string | null;
  };
}

const PRESET_COLORS = [
  "#00e87a", "#5b8fff", "#ff3d3d", "#f59e0b",
  "#c084fc", "#fb923c", "#34d399", "#f472b6",
  "#ffffff", "#94a3b8",
];

export function TeamInfo({ initialData }: TeamInfoProps) {
  const [open, setOpen]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl);
  const [teamColor, setTeamColor]     = useState(initialData.teamColor ?? "#00e87a");
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.set("teamColor", teamColor);
    if (logoPreview) formData.set("logoUrl", logoPreview);

    const result = await saveTeamInfo(formData);
    setSaving(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
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
          {/* Logo or icon */}
          {logoPreview ? (
            <img src={logoPreview} alt="Team logo"
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover",
                border: "1px solid var(--color-border-subtle)" }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8,
              background: `${teamColor}22`, border: `1px solid ${teamColor}44`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faShieldHalved}
                style={{ width: 16, height: 16, color: teamColor }} />
            </div>
          )}
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "1.1rem", color: "#eeeef5", textAlign: "left" }}>
              {initialData.name || "Team Info"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)", textAlign: "left", marginTop: 2 }}>
              {initialData.season}
              {initialData.league && ` · ${initialData.league}`}
              {initialData.homeField && ` · ${initialData.homeField}`}
            </div>
          </div>
        </div>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown}
          style={{ width: 14, height: 14, color: "var(--color-text-muted)" }} />
      </button>

      {/* Expandable body */}
      {open && (
        <form ref={formRef} onSubmit={handleSubmit} className="mt-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Team name */}
            <div>
              <label className="field-label" htmlFor="name">Team Name</label>
              <input id="name" name="name" className="input"
                defaultValue={initialData.name}
                placeholder="e.g. Thunder Sluggers" required />
            </div>

            {/* Season */}
            <div>
              <label className="field-label" htmlFor="season">Season</label>
              <input id="season" name="season" className="input"
                defaultValue={initialData.season}
                placeholder="e.g. Spring 2025" required />
            </div>

            {/* League */}
            <div>
              <label className="field-label" htmlFor="league">League Name</label>
              <input id="league" name="league" className="input"
                defaultValue={initialData.league ?? ""}
                placeholder="e.g. City Rec Slowpitch League" />
            </div>

            {/* Home field */}
            <div>
              <label className="field-label" htmlFor="homeField">Home Field</label>
              <input id="homeField" name="homeField" className="input"
                defaultValue={initialData.homeField ?? ""}
                placeholder="e.g. Riverside Park — Field 3" />
            </div>
          </div>

          {/* Team color */}
          <div className="mt-4">
            <div className="field-label mb-2">Team Color</div>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTeamColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, border: `2px solid ${teamColor === c ? "#fff" : "transparent"}`,
                    cursor: "pointer", outline: teamColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                    boxShadow: teamColor === c ? `0 0 0 3px ${c}44` : "none",
                    transition: "all 0.15s",
                  }}
                />
              ))}
              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={teamColor}
                  onChange={(e) => setTeamColor(e.target.value)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none",
                    cursor: "pointer", background: "none", padding: 0 }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                  color: "var(--color-text-muted)" }}>
                  {teamColor}
                </span>
              </div>
            </div>
          </div>

          {/* Logo upload */}
          <div className="mt-4">
            <div className="field-label mb-2">Team Logo</div>
            <div className="flex items-center gap-4">
              {/* Preview */}
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo preview"
                    style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover",
                      border: "1px solid var(--color-border-subtle)" }} />
                  <button
                    type="button"
                    onClick={() => { setLogoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{
                      position: "absolute", top: -6, right: -6,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#e02020", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark}
                      style={{ width: 10, height: 10, color: "#fff" }} />
                  </button>
                </div>
              ) : (
                <div
                  style={{ width: 72, height: 72, borderRadius: 12,
                    background: `${teamColor}15`, border: `2px dashed ${teamColor}44`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FontAwesomeIcon icon={faShieldHalved}
                    style={{ width: 24, height: 24, color: `${teamColor}88` }} />
                </div>
              )}

              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#eeeef5", fontFamily: "var(--font-body)",
                    }}
                  >
                    <FontAwesomeIcon icon={faUpload} style={{ width: 13, height: 13 }} />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </div>
                </label>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)",
                  marginTop: 4, fontFamily: "var(--font-body)" }}>
                  PNG, JPG or SVG · Max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-danger-400)" }}>
              ⚠ {error}
            </p>
          )}

          {/* Save */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
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
              SAVE TEAM INFO
            </button>
            {saved && (
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-brand)",
                fontWeight: 600, fontFamily: "var(--font-body)" }}>
                ✓ Saved!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
