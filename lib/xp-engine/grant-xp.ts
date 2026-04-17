import { prisma } from "@/lib/prisma";
import { getLevelForXP, getRankForLevel, xpThresholdForNextLevel } from "./level-table";
import type { Rank } from "@/types";

export interface GrantXPResult {
  userId:        string;
  xpGranted:     number;
  goldGranted:   number;
  newXpTotal:    number;
  newLevel:      number;
  newRank:       Rank;
  newXpToNext:   number;
  leveledUp:     boolean;
  rankedUp:      boolean;
  previousLevel: number;
  previousRank:  Rank;
}

/**
 * Otorga XP y Oro directamente a un usuario (sin registrar una actividad).
 * Usado por el sistema de Dungeons al completar una incursión.
 * Las dungeons dan 25% del XP en oro — mucho más que las actividades individuales (5%).
 */
export async function grantXP(userId: string, xpAmount: number): Promise<GrantXPResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const newXpTotal  = user.xpTotal + xpAmount;
  const newLevel    = getLevelForXP(newXpTotal);
  const newRank     = getRankForLevel(newLevel);
  const newXpToNext = xpThresholdForNextLevel(newLevel);
  const goldGranted = Math.max(5, Math.floor(xpAmount * 0.25));

  await prisma.user.update({
    where: { id: userId },
    data: {
      xpTotal:  newXpTotal,
      level:    newLevel,
      rank:     newRank,
      xpToNext: newXpToNext,
      gold:     { increment: goldGranted },
    },
  });

  return {
    userId,
    xpGranted:     xpAmount,
    goldGranted,
    newXpTotal,
    newLevel,
    newRank,
    newXpToNext,
    leveledUp:     newLevel > user.level,
    rankedUp:      newRank  !== user.rank,
    previousLevel: user.level,
    previousRank:  user.rank as Rank,
  };
}
