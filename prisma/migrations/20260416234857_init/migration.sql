-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('E', 'D', 'C', 'B', 'A', 'S');

-- CreateEnum
CREATE TYPE "HunterClass" AS ENUM ('FIGHTER', 'RANGER', 'MAGE', 'SHADOW');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('STRENGTH', 'AGILITY', 'INTELLIGENCE', 'MIXED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "xpToNext" INTEGER NOT NULL DEFAULT 1000,
    "rank" "Rank" NOT NULL DEFAULT 'E',
    "hunterClass" "HunterClass" NOT NULL DEFAULT 'SHADOW',
    "strength" INTEGER NOT NULL DEFAULT 10,
    "agility" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "category" "ActivityCategory" NOT NULL DEFAULT 'MIXED',
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "intensity" INTEGER NOT NULL DEFAULT 5,
    "xpGranted" INTEGER NOT NULL DEFAULT 0,
    "strengthGain" INTEGER NOT NULL DEFAULT 0,
    "agilityGain" INTEGER NOT NULL DEFAULT 0,
    "intelligenceGain" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
