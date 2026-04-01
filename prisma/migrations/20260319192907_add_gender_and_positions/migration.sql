-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "positions" "FieldingPosition"[];
