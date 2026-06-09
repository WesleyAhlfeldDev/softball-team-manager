import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBaseballBatBall,
  faUsers,
  faCalendarDays,
  faListOl,
  faBolt,
  faChartBar,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";

const FEATURES = [
  {
    icon: faUsers,
    title: "Roster",
    body: "Keep every player's number, position, and availability in one organized place.",
  },
  {
    icon: faCalendarDays,
    title: "Schedule",
    body: "Track games and seasons so the whole team knows when and where to show up.",
  },
  {
    icon: faListOl,
    title: "Lineup builder",
    body: "Set your batting order and fielding positions, then print a clean lineup sheet.",
  },
  {
    icon: faBolt,
    title: "Live scorebook",
    body: "Score every at-bat in real time, inning by inning, right from your phone.",
  },
  {
    icon: faChartBar,
    title: "Season stats",
    body: "Batting averages, team records, and player trends roll up automatically.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faBaseballBatBall}
            style={{ width: 20, height: 20, color: "var(--color-text-brand)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.2rem",
              letterSpacing: "0.05em",
              color: "var(--color-text-brand)",
            }}
          >
            TEAM MANAGER
          </span>
        </div>
        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: "var(--color-brand-500)", color: "#07070f", fontFamily: "var(--font-display)", letterSpacing: "0.05em", textDecoration: "none" }}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: "var(--color-brand-500)", color: "#07070f", fontFamily: "var(--font-display)", letterSpacing: "0.05em", textDecoration: "none" }}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-16 text-center md:px-6 md:pt-20">
        <p className="eyebrow">Slowpitch softball, organized</p>
        <h1
          className="mx-auto mt-4 max-w-3xl text-4xl md:text-6xl"
          style={{ color: "var(--color-text-primary)", lineHeight: 1.05 }}
        >
          Run your whole team from{" "}
          <span style={{ color: "var(--color-text-brand)" }}>one place</span>.
        </h1>
        <p
          className="mx-auto mt-5 max-w-xl text-base md:text-lg"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Manage your roster, schedule, batting lineup, live scorebook, and
          season stats — built for coaches and team captains who&apos;d rather be
          playing ball than wrangling spreadsheets.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--color-brand-500)", color: "#07070f", fontFamily: "var(--font-display)", letterSpacing: "0.05em", textDecoration: "none" }}
          >
            {isLoggedIn ? "Open dashboard" : "Get started"}
            <FontAwesomeIcon icon={faArrowRight} style={{ width: 13, height: 13 }} />
          </Link>
          {!isLoggedIn && (
            <Link
              href="/login"
              className="rounded-lg px-6 py-3 text-sm font-bold transition-colors"
              style={{ border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)", fontFamily: "var(--font-display)", letterSpacing: "0.05em", textDecoration: "none" }}
            >
              Log in
            </Link>
          )}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--color-brand-dim)" }}
              >
                <FontAwesomeIcon
                  icon={f.icon}
                  style={{ width: 18, height: 18, color: "var(--color-text-brand)" }}
                />
              </div>
              <h3 className="text-lg" style={{ color: "var(--color-text-primary)" }}>
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {f.body}
              </p>
            </div>
          ))}

          {/* CTA card filling the grid */}
          <div className="card card-brand flex flex-col justify-center">
            <h3 className="text-lg" style={{ color: "var(--color-text-primary)" }}>
              Ready when you are
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {isLoggedIn
                ? "Jump back into your team."
                : "Create an account and set up your team in minutes."}
            </p>
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="mt-4 flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "var(--color-brand-500)", color: "#07070f", fontFamily: "var(--font-display)", letterSpacing: "0.05em", textDecoration: "none" }}
            >
              {isLoggedIn ? "Go to dashboard" : "Get started"}
              <FontAwesomeIcon icon={faArrowRight} style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className="mx-auto max-w-5xl px-4 py-8 text-center text-xs md:px-6"
        style={{ color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border-subtle)" }}
      >
        Team Manager — built for slowpitch softball.
      </footer>
    </div>
  );
}
