import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getLevelForXP,
  getRankForLevel,
  xpThresholdForNextLevel,
} from "@/lib/xp-engine/level-table";
import { computeHunterClass } from "@/lib/xp-engine/hunter-class";

/**
 * DELETE /api/activities/[id]
 *
 * Revierte una actividad:
 * 1. Valida que el usuario autenticado sea el dueño
 * 2. Resta XP, stats y oro de la actividad al perfil del usuario
 * 3. Recalcula nivel, rango y clase dinámicamente
 * 4. Elimina el registro de la actividad
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: activityId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Cargar la actividad
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    if (activity.userId !== user.id) {
      return NextResponse.json({ error: "No tienes permiso para borrar esta actividad" }, { status: 403 });
    }

    // Cargar el perfil actual del cazador
    const hunter = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        activities: {
          where: { id: { not: activityId } }, // excluir la que se va a borrar
          select: { id: true, intensity: true, createdAt: true, category: true },
          orderBy: { createdAt: "desc" },
        },
        ownedItems: { where: { equipped: true } },
      },
    });

    // Calcular nuevas stats restando las ganancias de la actividad eliminada
    const newXpTotal    = Math.max(0, hunter.xpTotal - activity.xpGranted);
    const newStrength   = Math.max(10, hunter.strength - activity.strengthGain);
    const newAgility    = Math.max(10, hunter.agility - activity.agilityGain);
    const newIntelligence = Math.max(10, hunter.intelligence - activity.intelligenceGain);
    const newGold       = Math.max(0, hunter.gold - activity.goldGranted);

    // Recalcular nivel y rango
    const newLevel    = getLevelForXP(newXpTotal);
    const newRank     = getRankForLevel(newLevel);
    const newXpToNext = xpThresholdForNextLevel(newLevel);

    // Recalcular clase dinámica
    const totalActivities = hunter.activities.length; // ya excluye la borrada
    const recentIntensities = hunter.activities.slice(0, 20).map((a) => a.intensity);
    const recentAvgIntensity =
      recentIntensities.length > 0
        ? recentIntensities.reduce((s, i) => s + i, 0) / recentIntensities.length
        : 5;

    const newHunterClass = computeHunterClass({
      strength:           newStrength,
      agility:            newAgility,
      intelligence:       newIntelligence,
      level:              newLevel,
      rank:               newRank,
      totalActivities,
      currentStreak:      0, // conservador al revertir
      recentAvgIntensity,
    });

    // Ejecutar en transacción: borrar actividad + actualizar usuario
    await prisma.$transaction([
      prisma.activity.delete({ where: { id: activityId } }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          xpTotal:      newXpTotal,
          xpToNext:     newXpToNext,
          level:        newLevel,
          rank:         newRank,
          strength:     newStrength,
          agility:      newAgility,
          intelligence: newIntelligence,
          hunterClass:  newHunterClass,
          gold:         newGold,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        xpReverted:    activity.xpGranted,
        goldReverted:  activity.goldGranted,
        newXpTotal,
        newLevel,
        newRank,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
