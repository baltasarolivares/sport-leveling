-- M7: Economy System
-- Esta migración se aplica con prisma db execute + prisma migrate resolve
-- para evitar el bug de shadow database con enum values de PostgreSQL.

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'ACCESSORY');

-- AlterTable: oro del usuario
ALTER TABLE "users" ADD COLUMN "gold" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: oro ganado por actividad (necesario para reversión exacta)
ALTER TABLE "activities" ADD COLUMN "goldGranted" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: items únicos con escasez absoluta
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lore" TEXT,
    "rank" "Rank" NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "price" INTEGER NOT NULL,
    "xpMultiplierStr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xpMultiplierAgi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xpMultiplierInt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xpMultiplierAll" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strengthBonus" INTEGER NOT NULL DEFAULT 0,
    "agilityBonus" INTEGER NOT NULL DEFAULT 0,
    "intelligenceBonus" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "items_name_key" ON "items"("name");

CREATE INDEX "items_ownerId_idx" ON "items"("ownerId");

CREATE INDEX "items_rank_idx" ON "items"("rank");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
