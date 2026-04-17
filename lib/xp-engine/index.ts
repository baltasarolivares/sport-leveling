import { prisma } from "@/lib/prisma";
import type { ActivityCategory, Rank } from "@/types";
import { calculateActivityXP } from "./formulas";
import {
  getLevelForXP,
  getRankForLevel,
  xpThresholdForNextLevel,
} from "./level-table";
import {
  evaluateAccelerators,
  type Accelerator,
  type AcceleratorContext,
} from "./accelerators";
import { computeHunterClass } from "./hunter-class";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS DE RETORNO
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityInput {
  userId: string;
  rawText: string;
  title: string;
  notes?: string;
  category: ActivityCategory;
  durationMinutes: number;
  intensity: number; // 1–10
}

export interface ApplyActivityResult {
  // Actividad creada
  activityId: string;

  // XP y stats de la actividad base
  xpGranted: number;
  strengthGain: number;
  agilityGain: number;
  intelligenceGain: number;

  // Aceleradores disparados esta vez
  acceleratorsTriggered: Accelerator[];
  bonusXP: number; // XP extra por aceleradores

  // Economía
  goldGranted: number;

  // Estado nuevo del cazador
  newXpTotal: number;
  newLevel: number;
  newRank: Rank;
  newXpToNext: number;
  newHunterClass: string;

  // Eventos narrativos (para animaciones en UI)
  leveledUp: boolean;
  rankedUp: boolean;
  classChanged: boolean;
  previousLevel: number;
  previousRank: Rank;
  previousClass: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export async function applyActivity(
  input: ActivityInput
): Promise<ApplyActivityResult> {
  // 1. Cargar el cazador actual + items equipados
  const hunter = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
    include: {
      activities:  { select: { id: true } },
      ownedItems:  { where: { equipped: true } },
    },
  });

  // 2. Calcular XP y ganancias de la actividad (ya aplica multiplicador de categoría)
  const xpResult = calculateActivityXP(
    input.durationMinutes,
    input.intensity,
    input.category
  );

  // 2b. Aplicar multiplicadores de items equipados
  const equippedItems = hunter.ownedItems;
  let itemXPMultiplier = 1.0;
  for (const item of equippedItems) {
    itemXPMultiplier += item.xpMultiplierAll;
    if (input.category === "STRENGTH")     itemXPMultiplier += item.xpMultiplierStr;
    if (input.category === "AGILITY")      itemXPMultiplier += item.xpMultiplierAgi;
    if (input.category === "INTELLIGENCE") itemXPMultiplier += item.xpMultiplierInt;
  }
  const finalXP = Math.round(xpResult.xpGranted * itemXPMultiplier);

  // 2c. Calcular oro ganado — actividades individuales dan poco (fomentamos dungeons)
  const goldGranted = Math.max(1, Math.floor(finalXP * 0.05));

  // 3. Guardar la actividad en DB
  const activity = await prisma.activity.create({
    data: {
      userId:          input.userId,
      rawText:         input.rawText,
      title:           input.title,
      notes:           input.notes,
      category:        input.category,
      durationMinutes: input.durationMinutes,
      intensity:       input.intensity,
      xpGranted:       finalXP,
      strengthGain:    xpResult.strengthGain,
      agilityGain:     xpResult.agilityGain,
      intelligenceGain: xpResult.intelligenceGain,
      goldGranted,
    },
  });

  // 4. Calcular intensidad media reciente (últimas 20 actividades)
  const recentAvgIntensity = await computeAvgIntensity(input.userId);

  // 5. Evaluar aceleradores
  //    Por ahora almacenamos los IDs desbloqueados en un campo JSON futuro.
  //    En esta versión los derivamos consultando si ya existe un activity con ese bonus.
  //    En M4 agregaremos una tabla `unlocked_accelerators`.
  const totalActivities = hunter.activities.length + 1; // incluye la recién creada

  // Calcular racha (días consecutivos) — simplificado: últimas actividades por fecha
  const currentStreak = await computeStreak(input.userId);

  const ctx: AcceleratorContext = {
    totalActivities,
    currentStreak,
    currentLevel:  hunter.level,
    strength:      hunter.strength  + xpResult.strengthGain,
    agility:       hunter.agility   + xpResult.agilityGain,
    intelligence:  hunter.intelligence + xpResult.intelligenceGain,
    lastActivity: {
      durationMinutes: input.durationMinutes,
      intensity:       input.intensity,
      category:        input.category,
    },
  };

  // Lista de aceleradores ya desbloqueados (placeholder — tabla en M4+)
  const alreadyUnlocked: string[] = [];
  const triggered = evaluateAccelerators(ctx, alreadyUnlocked);
  const bonusXP = triggered.reduce((sum, a) => sum + a.xpBonus, 0);

  // 6. Actualizar stats del cazador
  const totalXPGained = finalXP + bonusXP;
  const newXpTotal    = hunter.xpTotal + totalXPGained;
  const newLevel      = getLevelForXP(newXpTotal);
  const newRank       = getRankForLevel(newLevel);
  const newXpToNext   = xpThresholdForNextLevel(newLevel);
  const newStrength   = hunter.strength     + xpResult.strengthGain;
  const newAgility    = hunter.agility      + xpResult.agilityGain;
  const newIntelligence = hunter.intelligence + xpResult.intelligenceGain;

  // 7. Recalcular clase basada en el nuevo perfil de stats
  const newHunterClass = computeHunterClass({
    strength:           newStrength,
    agility:            newAgility,
    intelligence:       newIntelligence,
    level:              newLevel,
    rank:               newRank,
    totalActivities,
    currentStreak,
    recentAvgIntensity,
  });

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      xpTotal:      newXpTotal,
      xpToNext:     newXpToNext,
      level:        newLevel,
      rank:         newRank,
      strength:     newStrength,
      agility:      newAgility,
      intelligence: newIntelligence,
      hunterClass:  newHunterClass,
      gold:         { increment: goldGranted },
    },
  });

  const previousClass = hunter.hunterClass as string;
  return {
    activityId: activity.id,
    xpGranted:       finalXP,
    strengthGain:    xpResult.strengthGain,
    agilityGain:     xpResult.agilityGain,
    intelligenceGain: xpResult.intelligenceGain,
    acceleratorsTriggered: triggered,
    bonusXP,
    goldGranted,
    newXpTotal,
    newLevel,
    newRank,
    newXpToNext,
    newHunterClass,
    leveledUp:    newLevel > hunter.level,
    rankedUp:     newRank  !== hunter.rank,
    classChanged: newHunterClass !== previousClass,
    previousLevel: hunter.level,
    previousRank:  hunter.rank as Rank,
    previousClass,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la racha actual de días consecutivos con al menos 1 actividad.
 * Itera hacia atrás desde hoy contando días que tienen actividad.
 */
async function computeStreak(userId: string): Promise<number> {
  // Traer fechas distintas de actividades (últimos 90 días como límite)
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const rows = await prisma.activity.findMany({
    where:   { userId, createdAt: { gte: since } },
    select:  { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (rows.length === 0) return 0;

  // Extraer días únicos en formato YYYY-MM-DD
  const uniqueDays = [
    ...new Set(
      rows.map((r) => r.createdAt.toISOString().slice(0, 10))
    ),
  ].sort((a, b) => b.localeCompare(a)); // descendente

  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let expected = today;

  for (const day of uniqueDays) {
    if (day === expected) {
      streak++;
      // Retroceder un día
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else if (day < expected) {
      // Hay un gap: racha rota
      break;
    }
  }

  return streak;
}

/**
 * Calcula la intensidad media de las últimas 20 actividades del cazador.
 * Se usa para detectar patrones de entrenamiento de alta exigencia.
 */
async function computeAvgIntensity(userId: string): Promise<number> {
  const rows = await prisma.activity.findMany({
    where:   { userId },
    select:  { intensity: true },
    orderBy: { createdAt: "desc" },
    take:    20,
  });
  if (rows.length === 0) return 5; // valor neutral por defecto
  return rows.reduce((sum, r) => sum + r.intensity, 0) / rows.length;
}

// Re-exportar utilidades para uso externo (simulación, tests)
export { calculateActivityXP } from "./formulas";
export {
  getLevelForXP,
  getRankForLevel,
  xpThresholdForNextLevel,
  xpThresholdForLevel,
  xpForLevel,
} from "./level-table";
export { ACCELERATORS, evaluateAccelerators } from "./accelerators";
