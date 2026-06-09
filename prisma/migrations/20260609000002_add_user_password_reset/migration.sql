-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tempPasswordExpires" TIMESTAMP(3);
