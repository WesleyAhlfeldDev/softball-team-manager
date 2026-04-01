-- CreateEnum
CREATE TYPE "FieldingPosition" AS ENUM ('PITCHER', 'CATCHER', 'FIRST_BASE', 'SECOND_BASE', 'THIRD_BASE', 'SHORTSTOP', 'LEFT_FIELD', 'CENTER_FIELD', 'RIGHT_FIELD', 'SHORT_FIELD', 'EXTRA_PLAYER', 'BENCH');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINAL', 'POSTPONED', 'CANCELLED', 'FORFEIT');

-- CreateEnum
CREATE TYPE "PlateAppearanceResult" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'HOME_RUN', 'GROUNDOUT', 'FLYOUT', 'LINEOUT', 'POPOUT', 'STRIKEOUT', 'WALK', 'HIT_BY_PITCH', 'REACHED_ON_ERROR', 'SAC_FLY', 'SAC_BUNT', 'FIELDERS_CHOICE', 'DOUBLE_PLAY', 'TRIPLE_PLAY');

-- CreateEnum
CREATE TYPE "PlayEventType" AS ENUM ('PLATE_APPEARANCE', 'RUN_SCORED', 'SUBSTITUTION', 'INNING_START', 'INNING_END', 'GAME_START', 'GAME_END', 'MERCY_RULE', 'NOTE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "league" TEXT,
    "logoUrl" TEXT,
    "homeField" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "jerseyNumber" TEXT,
    "primaryPosition" "FieldingPosition" NOT NULL DEFAULT 'BENCH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "isHome" BOOLEAN NOT NULL DEFAULT true,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "teamRuns" INTEGER NOT NULL DEFAULT 0,
    "opponentRuns" INTEGER NOT NULL DEFAULT 0,
    "teamHits" INTEGER NOT NULL DEFAULT 0,
    "opponentHits" INTEGER NOT NULL DEFAULT 0,
    "teamErrors" INTEGER NOT NULL DEFAULT 0,
    "opponentErrors" INTEGER NOT NULL DEFAULT 0,
    "totalInnings" INTEGER NOT NULL DEFAULT 7,
    "mercyRule" INTEGER DEFAULT 15,
    "mercyInning" INTEGER DEFAULT 4,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innings" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "inningNumber" INTEGER NOT NULL,
    "teamRuns" INTEGER NOT NULL DEFAULT 0,
    "opponentRuns" INTEGER NOT NULL DEFAULT 0,
    "teamHits" INTEGER NOT NULL DEFAULT 0,
    "teamErrors" INTEGER NOT NULL DEFAULT 0,
    "outs" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineup_slots" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "battingOrder" INTEGER NOT NULL,
    "fieldingPosition" "FieldingPosition" NOT NULL,

    CONSTRAINT "lineup_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plate_appearances" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "inningNumber" INTEGER NOT NULL,
    "battingOrderSlot" INTEGER NOT NULL,
    "atBatNumber" INTEGER NOT NULL,
    "result" "PlateAppearanceResult" NOT NULL,
    "rbis" INTEGER NOT NULL DEFAULT 0,
    "runsScored" BOOLEAN NOT NULL DEFAULT false,
    "leftOnBase" INTEGER NOT NULL DEFAULT 0,
    "hitDirection" TEXT,
    "hardHit" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plate_appearances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_events" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "inningId" TEXT,
    "type" "PlayEventType" NOT NULL,
    "inningNumber" INTEGER,
    "description" TEXT NOT NULL,
    "isUndo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_game_stats" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "atBats" INTEGER NOT NULL DEFAULT 0,
    "plateAppearances" INTEGER NOT NULL DEFAULT 0,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "singles" INTEGER NOT NULL DEFAULT 0,
    "doubles" INTEGER NOT NULL DEFAULT 0,
    "triples" INTEGER NOT NULL DEFAULT 0,
    "homeRuns" INTEGER NOT NULL DEFAULT 0,
    "rbi" INTEGER NOT NULL DEFAULT 0,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "walks" INTEGER NOT NULL DEFAULT 0,
    "strikeouts" INTEGER NOT NULL DEFAULT 0,
    "sacFlies" INTEGER NOT NULL DEFAULT 0,
    "reachedOnError" INTEGER NOT NULL DEFAULT 0,
    "leftOnBase" INTEGER NOT NULL DEFAULT 0,
    "hardHits" INTEGER NOT NULL DEFAULT 0,
    "battingAvg" DOUBLE PRECISION,
    "slugging" DOUBLE PRECISION,
    "obp" DOUBLE PRECISION,
    "ops" DOUBLE PRECISION,

    CONSTRAINT "player_game_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_season_stats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "atBats" INTEGER NOT NULL DEFAULT 0,
    "plateAppearances" INTEGER NOT NULL DEFAULT 0,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "singles" INTEGER NOT NULL DEFAULT 0,
    "doubles" INTEGER NOT NULL DEFAULT 0,
    "triples" INTEGER NOT NULL DEFAULT 0,
    "homeRuns" INTEGER NOT NULL DEFAULT 0,
    "rbi" INTEGER NOT NULL DEFAULT 0,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "walks" INTEGER NOT NULL DEFAULT 0,
    "strikeouts" INTEGER NOT NULL DEFAULT 0,
    "sacFlies" INTEGER NOT NULL DEFAULT 0,
    "reachedOnError" INTEGER NOT NULL DEFAULT 0,
    "leftOnBase" INTEGER NOT NULL DEFAULT 0,
    "hardHits" INTEGER NOT NULL DEFAULT 0,
    "battingAvg" DOUBLE PRECISION,
    "slugging" DOUBLE PRECISION,
    "obp" DOUBLE PRECISION,
    "ops" DOUBLE PRECISION,
    "currentHitStreak" INTEGER NOT NULL DEFAULT 0,
    "longestHitStreak" INTEGER NOT NULL DEFAULT 0,
    "currentOnBaseStreak" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_season_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_season_stats" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "forfeits" INTEGER NOT NULL DEFAULT 0,
    "runsScored" INTEGER NOT NULL DEFAULT 0,
    "runsAllowed" INTEGER NOT NULL DEFAULT 0,
    "runDiff" INTEGER NOT NULL DEFAULT 0,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "doubles" INTEGER NOT NULL DEFAULT 0,
    "triples" INTEGER NOT NULL DEFAULT 0,
    "homeRuns" INTEGER NOT NULL DEFAULT 0,
    "walks" INTEGER NOT NULL DEFAULT 0,
    "strikeouts" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "leftOnBase" INTEGER NOT NULL DEFAULT 0,
    "teamBattingAvg" DOUBLE PRECISION,
    "teamSlg" DOUBLE PRECISION,
    "teamObp" DOUBLE PRECISION,
    "teamOps" DOUBLE PRECISION,
    "runsPerGame" DOUBLE PRECISION,
    "currentWinStreak" INTEGER NOT NULL DEFAULT 0,
    "longestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "currentLoseStreak" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_season_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "innings_gameId_inningNumber_key" ON "innings"("gameId", "inningNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lineup_slots_gameId_battingOrder_key" ON "lineup_slots"("gameId", "battingOrder");

-- CreateIndex
CREATE UNIQUE INDEX "lineup_slots_gameId_playerId_key" ON "lineup_slots"("gameId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_game_stats_gameId_playerId_key" ON "player_game_stats"("gameId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_season_stats_playerId_key" ON "player_season_stats"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "team_season_stats_teamId_key" ON "team_season_stats"("teamId");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineup_slots" ADD CONSTRAINT "lineup_slots_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineup_slots" ADD CONSTRAINT "lineup_slots_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plate_appearances" ADD CONSTRAINT "plate_appearances_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plate_appearances" ADD CONSTRAINT "plate_appearances_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_events" ADD CONSTRAINT "play_events_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_events" ADD CONSTRAINT "play_events_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "innings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_game_stats" ADD CONSTRAINT "player_game_stats_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_season_stats" ADD CONSTRAINT "team_season_stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
