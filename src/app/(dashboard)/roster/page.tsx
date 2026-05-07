import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerForm } from "@/components/roster/PlayerForm";
import { PlayerRow } from "@/components/roster/PlayerRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

export const metadata = { title: "Roster" };

export default async function RosterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    include: {
      players: {
        orderBy: [{ isActive: "desc" }, { jerseyNumber: "asc" }],
        include: {
          playerStats: {
            where:  { season: { isActive: true } },
            select: { battingAvg: true, ops: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!team) redirect("/login");

  const activePlayers   = team.players.filter((p) => p.isActive);
  const inactivePlayers = team.players.filter((p) => !p.isActive);

  return (
    <div>
      <PageHeader
        eyebrow="Squad"
        title="Roster"
        subtitle={`${activePlayers.length} active · ${inactivePlayers.length} inactive`}
      />

      <PlayerForm />

      {team.players.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <FontAwesomeIcon icon={faUsers} style={{ width: 32, height: 32, color: "rgba(238,238,245,0.4)" }} />
          <p style={{ color: "rgba(238,238,245,0.4)", margin: 0 }}>
            No players yet. Add your first player above!
          </p>
        </div>
      )}

      {team.players.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-subtle)", background: "rgba(255,255,255,0.02)" }}>
                {["#", "Player", "Gender", "Positions", "AVG", "OPS", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(238,238,245,0.4)",
                      textAlign: h === "Player" || h === "Positions" ? "left" : h === "" ? "right" : "center",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.players.map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
