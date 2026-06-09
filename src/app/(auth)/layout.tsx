import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaseballBatBall } from "@fortawesome/free-solid-svg-icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 no-underline"
        style={{ textDecoration: "none" }}
      >
        <FontAwesomeIcon
          icon={faBaseballBatBall}
          style={{ width: 22, height: 22, color: "var(--color-text-brand)" }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.35rem",
            letterSpacing: "0.05em",
            color: "var(--color-text-brand)",
          }}
        >
          TEAM MANAGER
        </span>
      </Link>
      <div className="card card-brand w-full max-w-sm" style={{ boxShadow: "var(--shadow-card)" }}>
        {children}
      </div>
    </div>
  );
}
