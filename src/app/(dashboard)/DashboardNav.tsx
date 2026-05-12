"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUsers,
  faCalendarDays,
  faListOl,
  faBolt,
  faBars,
  faXmark,
  faBaseballBatBall,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: faHouse },
  { href: "/roster",    label: "Roster",    icon: faUsers },
  { href: "/schedule",  label: "Schedule",  icon: faCalendarDays },
  { href: "/lineup",    label: "Lineup",    icon: faListOl },
  { href: "/stats",     label: "Stats",     icon: faChartBar },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6"
        style={{
          height: 56,
          background: "var(--color-surface-card)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 no-underline"
          style={{ textDecoration: "none" }}
        >
          <FontAwesomeIcon
            icon={faBaseballBatBall}
            style={{ width: 18, height: 18, color: "var(--color-text-brand)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.05em",
              color: "var(--color-text-brand)",
            }}
          >
            TEAM MANAGER
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
              style={{
                fontFamily: "var(--font-body)",
                color: isActive(item.href)
                  ? "var(--color-text-brand)"
                  : "var(--color-text-muted)",
                background: isActive(item.href)
                  ? "var(--color-brand-dim)"
                  : "transparent",
                borderBottom: isActive(item.href)
                  ? "2px solid var(--color-text-brand)"
                  : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              <FontAwesomeIcon
                icon={item.icon}
                style={{ width: 14, height: 14 }}
              />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Go Live button */}
          <Link
            href="/scorebook"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-opacity hover:opacity-80 md:flex"
            style={{
              background: "var(--color-danger-500)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              letterSpacing: "0.05em",
              textDecoration: "none",
            }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ width: 12, height: 12 }} />
            GO LIVE
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="flex items-center justify-center rounded-lg p-2 md:hidden"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <FontAwesomeIcon
              icon={mobileOpen ? faXmark : faBars}
              style={{ width: 18, height: 18 }}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="border-b md:hidden"
          style={{
            background: "var(--color-surface-card)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <div className="flex flex-col gap-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold"
                style={{
                  fontFamily: "var(--font-body)",
                  color: isActive(item.href)
                    ? "var(--color-text-brand)"
                    : "var(--color-text-secondary)",
                  background: isActive(item.href)
                    ? "var(--color-brand-dim)"
                    : "transparent",
                  textDecoration: "none",
                }}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  style={{ width: 16, height: 16 }}
                />
                {item.label}
              </Link>
            ))}

            <Link
              href="/scorebook"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold"
              style={{
                background: "var(--color-danger-500)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.05em",
                textDecoration: "none",
              }}
            >
              <FontAwesomeIcon icon={faBolt} style={{ width: 16, height: 16 }} />
              GO LIVE
            </Link>

          </div>
        </div>
      )}
    </>
  );
}
