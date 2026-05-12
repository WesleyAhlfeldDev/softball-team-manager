import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatsView } from "@/components/stats/StatsView";

export const metadata = { title: "Stats" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const team = await prisma.team.findFirst({
    where: { userId },
    include: {
      seasons: {
        orderBy: { createdAt: "desc" },
        include: {
          teamStats: true,
          playerStats: {
            include: {
              player: {
                select: {
                  firstName: true, lastName: true, jerseyNumber: true, isActive: true,
                },
              },
            },
            orderBy: { battingAvg: "desc" },
          },
        },
      },
    },
  });

  if (!team) redirect("/login");

  const activeSeasonId = team.seasons.find((s) => s.isActive)?.id ?? null;
  const teamColor = team.teamColor ?? "#00e87a";

  return (
    <StatsView
      seasons={team.seasons}
      activeSeasonId={activeSeasonId}
      teamColor={teamColor}
    />
  );
}
