import { prisma } from "@/lib/prisma";
import { getRankForLevel, xpThresholdForLevel, xpThresholdForNextLevel } from "@/lib/xp-engine";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardData {
  hunter: {
    id: string;
    name: string;
    level: number;
    xpTotal: number;
    xpCurrentLevel: number;   // XP acumulada desde el inicio del nivel actual
    xpNeededThisLevel: number; // XP total que cuesta este nivel
    xpPercent: number;         // 0–100
    rank: string;
    hunterClass: string;
    strength: number;
    agility: number;
    intelligence: number;
  };
  weeklyXP: number;
  totalActivities: number;
  recentActivities: {
    id: string;
    title: string;
    category: string;
    durationMinutes: number;
    intensity: number;
    xpGranted: number;
    strengthGain: number;
    agilityGain: number;
    intelligenceGain: number;
    createdAt: Date;
  }[];
  statDistribution: {
    strength: number;
    agility: number;
    intelligence: number;
    total: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!user) return null;

  // XP de esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyAgg = await prisma.activity.aggregate({
    where:  { userId: user.id, createdAt: { gte: weekAgo } },
    _sum:   { xpGranted: true },
    _count: { id: true },
  });

  const totalActivities = await prisma.activity.count({
    where: { userId: user.id },
  });

  // Progresión dentro del nivel actual
  const xpStartOfLevel    = xpThresholdForLevel(user.level);
  const xpStartOfNextLevel = xpThresholdForNextLevel(user.level);
  const xpNeededThisLevel = xpStartOfNextLevel - xpStartOfLevel;
  const xpCurrentLevel    = user.xpTotal - xpStartOfLevel;
  const xpPercent         = Math.min(100, Math.round((xpCurrentLevel / xpNeededThisLevel) * 100));

  // Distribución de stats
  const total = user.strength + user.agility + user.intelligence;

  return {
    hunter: {
      id:               user.id,
      name:             user.name,
      level:            user.level,
      xpTotal:          user.xpTotal,
      xpCurrentLevel,
      xpNeededThisLevel,
      xpPercent,
      rank:             user.rank,
      hunterClass:      user.hunterClass,
      strength:         user.strength,
      agility:          user.agility,
      intelligence:     user.intelligence,
    },
    weeklyXP:         weeklyAgg._sum.xpGranted ?? 0,
    totalActivities,
    recentActivities: user.activities.map((a) => ({
      id:              a.id,
      title:           a.title,
      category:        a.category,
      durationMinutes: a.durationMinutes,
      intensity:       a.intensity,
      xpGranted:       a.xpGranted,
      strengthGain:    a.strengthGain,
      agilityGain:     a.agilityGain,
      intelligenceGain: a.intelligenceGain,
      createdAt:       a.createdAt,
    })),
    statDistribution: { strength: user.strength, agility: user.agility, intelligence: user.intelligence, total },
  };
}
