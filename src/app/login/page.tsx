"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faBolt,
  faSpinner,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-surface-bg)] px-4">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 60%, rgba(0,232,122,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(91,143,255,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <FontAwesomeIcon
              icon={faBolt}
              className="text-[var(--color-text-brand)]"
              style={{ width: 20, height: 20 }}
            />
            <span className="eyebrow text-sm tracking-widest">
              Slowpitch Team Manager
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 4.5rem)",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            ADMIN
            <br />
            <span style={{ color: "var(--color-text-brand)" }}>PORTAL</span>
          </h1>
          <div
            style={{
              width: 48,
              height: 3,
              background: "var(--color-text-brand)",
              margin: "16px auto 0",
              borderRadius: 2,
            }}
          />
        </div>

        {/* Card */}
        <div className="card card-brand">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="coach@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-11"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                  tabIndex={-1}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    style={{ width: 16, height: 16 }}
                  />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
                style={{
                  background: "var(--color-danger-dim)",
                  border: "1px solid rgba(255,61,61,0.3)",
                  color: "var(--color-danger-400)",
                }}
              >
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  style={{ width: 14, height: 14, flexShrink: 0 }}
                />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: "var(--color-text-brand)",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                letterSpacing: "0.05em",
              }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    style={{ width: 16, height: 16 }}
                  />
                  SIGNING IN...
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faLock}
                    style={{ width: 16, height: 16 }}
                  />
                  SIGN IN
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
            Seed credentials:{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
              coach@example.com / admin123
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
