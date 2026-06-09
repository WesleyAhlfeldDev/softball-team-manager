/**
 * Re-home the existing data onto your own account.
 *
 * All current teams/games/stats belong to a single seeded user. This script
 * updates that user's email + password to yours, keeping the user id (and
 * therefore every related row) intact.
 *
 * Run locally so your credentials never leave your machine:
 *
 *   PowerShell:
 *     $env:OWNER_EMAIL='you@example.com'; $env:OWNER_PASSWORD='your-password'; npm run rehome-owner
 *
 *   bash:
 *     OWNER_EMAIL=you@example.com OWNER_PASSWORD=your-password npm run rehome-owner
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// tsx (and the Prisma CLI) don't auto-load .env.local the way Next.js does.
// Load DATABASE_URL etc. from .env.local then .env before connecting.
// Values already set in the shell win; .env.local wins over .env.
for (const file of [".env.local", ".env"]) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match || match[1].startsWith("#")) continue;
      const key = match[1];
      if (process.env[key] !== undefined) continue;
      let value = (match[2] ?? "").trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // file may not exist — that's fine
  }
}

const prisma = new PrismaClient();

async function main() {
  const email = process.env.OWNER_EMAIL?.trim();
  const password = process.env.OWNER_PASSWORD;
  const name = process.env.OWNER_NAME?.trim();

  if (!email || !password) {
    throw new Error(
      "Set OWNER_EMAIL and OWNER_PASSWORD env vars before running this script.",
    );
  }
  if (password.length < 8) {
    throw new Error("OWNER_PASSWORD must be at least 8 characters.");
  }

  // The account that owns the most teams is the existing data owner.
  const owner = await prisma.user.findFirst({
    orderBy: { teams: { _count: "desc" } },
    include: { _count: { select: { teams: true } } },
  });

  if (!owner) {
    throw new Error("No user found in the database — nothing to re-home.");
  }

  // Guard against clobbering a *different* existing account with this email.
  const emailHolder = await prisma.user.findUnique({ where: { email } });
  if (emailHolder && emailHolder.id !== owner.id) {
    throw new Error(
      `Another account already uses ${email}. Choose a different OWNER_EMAIL.`,
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const updated = await prisma.user.update({
    where: { id: owner.id },
    data: { email, passwordHash, ...(name ? { name } : {}) },
  });

  console.log(
    `✅ Re-homed ${owner._count.teams} team(s) to ${updated.email} (user ${updated.id}).`,
  );
  console.log("   You can now log in with that email and password.");
}

main()
  .catch((err) => {
    console.error("❌", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
