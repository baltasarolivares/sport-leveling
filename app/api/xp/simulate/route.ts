import { NextRequest, NextResponse } from "next/server";
import {
  calculateActivityXP,
  getLevelForXP,
  getRankForLevel,
  xpThresholdForNextLevel,
  xpForLevel,
} from "@/lib/xp-engine";
import type { ActivityCategory } from "@/types";

/**
 * GET /api/xp/simulate
 *
 * Simula el resultado de registrar una actividad sin escribir en la base de datos.
 * Ideal para visualizar el impacto antes de confirmar o para probar las fórmulas.
 *
 * Query params:
 *   duration   → minutos de la actividad         (default: 60)
 *   intensity  → escala 1–10                     (default: 7)
 *   category   → STRENGTH | AGILITY | INTELLIGENCE | MIXED (default: MIXED)
 *   currentXP  → XP total actual del cazador     (default: 0)
 */
export async function GET(req: NextRequest) {
  const params  = req.nextUrl.searchParams;
  const duration   = Math.max(1, Number(params.get("duration")  ?? 60));
  const intensity  = Math.max(1, Math.min(10, Number(params.get("intensity") ?? 7)));
  const category   = (params.get("category") ?? "MIXED") as ActivityCategory;
  const currentXP  = Math.max(0, Number(params.get("currentXP") ?? 0));

  const VALID_CATEGORIES: ActivityCategory[] = [
    "STRENGTH", "AGILITY", "INTELLIGENCE", "MIXED",
  ];
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `category debe ser uno de: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  // ── Cálculos ────────────────────────────────────────────────────
  const xpResult   = calculateActivityXP(duration, intensity, category);
  const newXpTotal = currentXP + xpResult.xpGranted;

  const prevLevel  = getLevelForXP(currentXP);
  const newLevel   = getLevelForXP(newXpTotal);
  const prevRank   = getRankForLevel(prevLevel);
  const newRank    = getRankForLevel(newLevel);
  const xpToNext   = xpThresholdForNextLevel(newLevel);

  // Coste de los próximos 5 niveles (útil para mostrar la curva)
  const nextLevelsCost = Array.from({ length: 5 }, (_, i) => ({
    level: newLevel + i + 1,
    xpRequired: xpForLevel(newLevel + i + 1),
  }));

  return NextResponse.json({
    input: { duration, intensity, category, currentXP },
    activity: {
      xpGranted:       xpResult.xpGranted,
      strengthGain:    xpResult.strengthGain,
      agilityGain:     xpResult.agilityGain,
      intelligenceGain: xpResult.intelligenceGain,
    },
    progression: {
      previousXP:   currentXP,
      newXpTotal,
      previousLevel: prevLevel,
      newLevel,
      previousRank:  prevRank,
      newRank,
      xpToNextLevel: xpToNext,
      leveledUp: newLevel > prevLevel,
      rankedUp:  newRank  !== prevRank,
    },
    curve: {
      nextLevelsCost,
    },
  });
}
