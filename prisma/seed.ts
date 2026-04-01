import { PrismaClient, FieldingPosition, GameStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean up ──────────────────────────────────────────────
  await prisma.playEvent.deleteMany();
  await prisma.plateAppearance.deleteMany();
  await prisma.playerGameStats.deleteMany();
  await prisma.playerSeasonStats.deleteMany();
  await prisma.teamSeasonStats.deleteMany();
  await prisma.lineupSlot.deleteMany();
  await prisma.inning.deleteMany();
  await prisma.game.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // ── User (admin) ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.create({
    data: {
      email: "coach@example.com",
      passwordHash,
      name: "Coach",
    },
  });

  // ── Team ──────────────────────────────────────────────────
  const team = await prisma.team.create({
    data: {
      name: "Your Team Name",
      season: "Spring 2025",
      league: "",
      homeField: "",
      userId: user.id,
    },
  });

  await prisma.teamSeasonStats.create({ data: { teamId: team.id } });

  // ── Players ───────────────────────────────────────────────
  const playerData: {
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    primaryPosition: FieldingPosition;
    positions: FieldingPosition[];
  }[] = [
    {
      firstName: "Wesley",   lastName: "Ahlfeld",
      gender: "MALE",        primaryPosition: "SHORTSTOP",
      positions: ["SHORTSTOP", "FIRST_BASE", "CENTER_FIELD", "LEFT_FIELD"],
    },
    {
      firstName: "Lee",      lastName: "Pruneda",
      gender: "FEMALE",      primaryPosition: "CATCHER",
      positions: ["CATCHER", "SECOND_BASE", "RIGHT_FIELD", "LEFT_FIELD"],
    },
    {
      firstName: "Toni",     lastName: "Rhule",
      gender: "FEMALE",      primaryPosition: "SECOND_BASE",
      positions: ["SECOND_BASE", "CATCHER", "LEFT_FIELD", "RIGHT_FIELD"],
    },
    {
      firstName: "Brendan",  lastName: "Caseria",
      gender: "MALE",        primaryPosition: "FIRST_BASE",
      positions: ["FIRST_BASE"],
    },
    {
      firstName: "Chris",    lastName: "Adkins",
      gender: "MALE",        primaryPosition: "LEFT_FIELD",
      positions: ["LEFT_FIELD", "CENTER_FIELD", "RIGHT_FIELD", "SHORT_FIELD"],
    },
    {
      firstName: "Cody",     lastName: "Applegarth",
      gender: "MALE",        primaryPosition: "PITCHER",
      positions: ["PITCHER", "LEFT_FIELD", "CENTER_FIELD", "RIGHT_FIELD", "SHORT_FIELD"],
    },
    {
      firstName: "Deb",      lastName: "Miller",
      gender: "FEMALE",      primaryPosition: "SECOND_BASE",
      positions: ["SECOND_BASE", "RIGHT_FIELD", "LEFT_FIELD", "CATCHER"],
    },
    {
      firstName: "Grace",    lastName: "Arzola",
      gender: "FEMALE",      primaryPosition: "CATCHER",
      positions: ["CATCHER", "LEFT_FIELD", "RIGHT_FIELD"],
    },
    {
      firstName: "James",    lastName: "Reid",
      gender: "MALE",        primaryPosition: "CENTER_FIELD",
      positions: ["LEFT_FIELD", "PITCHER", "FIRST_BASE", "RIGHT_FIELD", "CENTER_FIELD", "SHORT_FIELD"],
    },
    {
      firstName: "John",     lastName: "Atkinson",
      gender: "MALE",        primaryPosition: "THIRD_BASE",
      positions: ["THIRD_BASE", "SHORTSTOP", "FIRST_BASE"],
    },
    {
      firstName: "Lily",     lastName: "B",
      gender: "FEMALE",      primaryPosition: "RIGHT_FIELD",
      positions: ["CATCHER", "LEFT_FIELD", "RIGHT_FIELD"],
    },
    {
      firstName: "Matt",     lastName: "Boyle",
      gender: "MALE",        primaryPosition: "THIRD_BASE",
      positions: ["THIRD_BASE", "LEFT_FIELD", "CENTER_FIELD", "RIGHT_FIELD", "SHORT_FIELD"],
    },
    {
      firstName: "Samantha", lastName: "Stewart",
      gender: "FEMALE",      primaryPosition: "RIGHT_FIELD",
      positions: ["RIGHT_FIELD", "LEFT_FIELD"],
    },
    {
      firstName: "Tim",      lastName: "Miller",
      gender: "MALE",        primaryPosition: "CENTER_FIELD",
      positions: ["LEFT_FIELD", "RIGHT_FIELD", "SHORT_FIELD", "CENTER_FIELD"],
    },
  ];

  const players = await Promise.all(
    playerData.map((p) =>
      prisma.player.create({
        data: { teamId: team.id, ...p, isActive: true },
      })
    )
  );

  await Promise.all(
    players.map((p) =>
      prisma.playerSeasonStats.create({ data: { playerId: p.id } })
    )
  );

  console.log("✅ Seed complete!");
  console.log(`   User:    coach@example.com / admin123`);
  console.log(`   Team:    ${team.name}`);
  console.log(`   Players: ${players.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
