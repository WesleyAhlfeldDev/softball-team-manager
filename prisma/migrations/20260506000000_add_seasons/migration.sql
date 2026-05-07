-- Migration: Add seasons table and scope all season data to Season records

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
--    ID format: 'init_' + teamId (guaranteed unique)
INSERT INTO "seasons" ("id", "teamId", "name", "isActive", "createdAt")
SELECT
    'init_' || "id",
    "id",
    "season",
    true,
    "createdAt"
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

-- Swap unique constraint: playerId alone -> (playerId, seasonId)
ALTER TABLE "player_season_stats"
    DROP CONSTRAINT "player_season_stats_playerId_key";

ALTER TABLE "player_season_stats"
    ADD CONSTRAINT "player_season_stats_playerId_seasonId_key"
    UNIQUE ("playerId", "seasonId");

-- 5. Add seasonId to team_season_stats, drop old teamId unique/FK
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

ALTER TABLE "team_season_stats"
    DROP CONSTRAINT "team_season_stats_teamId_key";

ALTER TABLE "team_season_stats"
    ADD CONSTRAINT "team_season_stats_seasonId_key"
    UNIQUE ("seasonId");

-- Drop the teamId column (team is accessible via season.teamId)
ALTER TABLE "team_season_stats" DROP COLUMN "teamId";

-- 6. Drop the season string column from teams (replaced by seasons table)
ALTER TABLE "teams" DROP COLUMN "season";
