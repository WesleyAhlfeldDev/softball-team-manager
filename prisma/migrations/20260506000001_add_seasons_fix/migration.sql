-- Complete add_seasons migration.
-- The original migration (20260506000000) was rolled back by Postgres when it failed
-- (Prisma wraps migrations in a transaction), so the database is still at the
-- initial state. This migration does all the work correctly:
-- unique indexes from Prisma are DROP INDEX, not DROP CONSTRAINT.

-- 1. Create seasons table
CREATE TABLE "seasons" (
    "id"        TEXT         NOT NULL,
    "teamId"    TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "isActive"  BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "seasons"
    ADD CONSTRAINT "seasons_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "teams"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Seed one active Season per Team from the existing team.season string
INSERT INTO "seasons" ("id", "teamId", "name", "isActive", "createdAt")
SELECT 'init_' || "id", "id", "season", true, "createdAt"
FROM "teams";

-- 3. Add seasonId to games
ALTER TABLE "games" ADD COLUMN "seasonId" TEXT;

UPDATE "games" g
SET "seasonId" = s."id"
FROM "seasons" s
WHERE s."teamId" = g."teamId" AND s."isActive" = true;

ALTER TABLE "games" ALTER COLUMN "seasonId" SET NOT NULL;

ALTER TABLE "games"
    ADD CONSTRAINT "games_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "seasons"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Add seasonId to player_season_stats
ALTER TABLE "player_season_stats" ADD COLUMN "seasonId" TEXT;

UPDATE "player_season_stats" pss
SET "seasonId" = s."id"
FROM "players" p
JOIN "seasons" s ON s."teamId" = p."teamId" AND s."isActive" = true
WHERE pss."playerId" = p."id";

DELETE FROM "player_season_stats" WHERE "seasonId" IS NULL;

ALTER TABLE "player_season_stats" ALTER COLUMN "seasonId" SET NOT NULL;

ALTER TABLE "player_season_stats"
    ADD CONSTRAINT "player_season_stats_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "seasons"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma created this as a UNIQUE INDEX, not a named CONSTRAINT — use DROP INDEX
DROP INDEX "player_season_stats_playerId_key";

CREATE UNIQUE INDEX "player_season_stats_playerId_seasonId_key"
    ON "player_season_stats"("playerId", "seasonId");

-- 5. Add seasonId to team_season_stats
ALTER TABLE "team_season_stats" ADD COLUMN "seasonId" TEXT;

UPDATE "team_season_stats" tss
SET "seasonId" = s."id"
FROM "seasons" s
WHERE s."teamId" = tss."teamId" AND s."isActive" = true;

DELETE FROM "team_season_stats" WHERE "seasonId" IS NULL;

ALTER TABLE "team_season_stats" ALTER COLUMN "seasonId" SET NOT NULL;

ALTER TABLE "team_season_stats"
    ADD CONSTRAINT "team_season_stats_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "seasons"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique index via DROP INDEX; FK via DROP CONSTRAINT
DROP INDEX "team_season_stats_teamId_key";
ALTER TABLE "team_season_stats" DROP CONSTRAINT "team_season_stats_teamId_fkey";

CREATE UNIQUE INDEX "team_season_stats_seasonId_key"
    ON "team_season_stats"("seasonId");

ALTER TABLE "team_season_stats" DROP COLUMN "teamId";

-- 6. Drop the season string column from teams (replaced by seasons table)
ALTER TABLE "teams" DROP COLUMN "season";
