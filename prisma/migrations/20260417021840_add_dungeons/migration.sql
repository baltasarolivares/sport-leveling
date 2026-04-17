-- CreateEnum
CREATE TYPE "DungeonStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "dungeons" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "xpBonus" INTEGER NOT NULL DEFAULT 1000,
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "status" "DungeonStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dungeons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dungeon_participants" (
    "id" TEXT NOT NULL,
    "dungeonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpReceived" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dungeon_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dungeons_status_idx" ON "dungeons"("status");

-- CreateIndex
CREATE INDEX "dungeons_scheduledAt_idx" ON "dungeons"("scheduledAt");

-- CreateIndex
CREATE INDEX "dungeon_participants_userId_idx" ON "dungeon_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dungeon_participants_dungeonId_userId_key" ON "dungeon_participants"("dungeonId", "userId");

-- AddForeignKey
ALTER TABLE "dungeons" ADD CONSTRAINT "dungeons_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dungeon_participants" ADD CONSTRAINT "dungeon_participants_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "dungeons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dungeon_participants" ADD CONSTRAINT "dungeon_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
