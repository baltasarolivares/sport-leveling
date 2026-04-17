-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HunterClass" ADD VALUE 'NOVICE';
ALTER TYPE "HunterClass" ADD VALUE 'ASSASSIN';
ALTER TYPE "HunterClass" ADD VALUE 'BEAST';
ALTER TYPE "HunterClass" ADD VALUE 'HEALER';
ALTER TYPE "HunterClass" ADD VALUE 'MONARCH';
ALTER TYPE "HunterClass" ADD VALUE 'SOVEREIGN';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "hunterClass" SET DEFAULT 'NOVICE';
