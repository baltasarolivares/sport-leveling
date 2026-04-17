/**
 * Sistema de Clases Dinámico — Solo Leveling
 *
 * La clase NO se elige: se GANA por comportamiento real.
 * Se recalcula después de cada actividad registrada.
 *
 * Lógica: trabajamos sobre el "stat gain neto" (puntos ganados
 * por encima del stat base de 10) para que los primeros usuarios
 * no hereden el sesgo del valor inicial.
 *
 * Prioridad de evaluación (más rara → más común):
 *   SOVEREIGN → MONARCH → SHADOW → HEALER → BEAST → ASSASSIN
 *   → FIGHTER → RANGER → MAGE → NOVICE
 */

import type { HunterClass } from "@/types";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface ClassInput {
  strength:           number;
  agility:            number;
  intelligence:       number;
  level:              number;
  rank:               string;   // "E" | "D" | "C" | "B" | "A" | "S"
  totalActivities:    number;
  currentStreak:      number;
  recentAvgIntensity: number;   // media de las últimas 20 actividades
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const RANK_SCORE: Record<string, number> = { E: 0, D: 1, C: 2, B: 3, A: 4, S: 5 };
const STAT_BASE = 10; // valor inicial de cada stat

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────

export function computeHunterClass(input: ClassInput): HunterClass {
  const {
    strength, agility, intelligence,
    level, rank, totalActivities,
    currentStreak, recentAvgIntensity,
  } = input;

  // ── Ganancia neta (excluye el stat base de inicio) ───────────
  const strGain  = Math.max(0, strength    - STAT_BASE);
  const agiGain  = Math.max(0, agility     - STAT_BASE);
  const intGain  = Math.max(0, intelligence - STAT_BASE);
  const totalGain = strGain + agiGain + intGain;

  // Sin datos suficientes
  if (totalGain < 5 || totalActivities < 3) return "NOVICE";

  const strPct = strGain  / totalGain;
  const agiPct = agiGain  / totalGain;
  const intPct = intGain  / totalGain;

  const maxPct    = Math.max(strPct, agiPct, intPct);
  const minPct    = Math.min(strPct, agiPct, intPct);
  const spread    = maxPct - minPct;          // qué tan equilibrado es
  const rankScore = RANK_SCORE[rank] ?? 0;

  // ════════════════════════════════════════════
  // LEGENDARIO
  // ════════════════════════════════════════════

  // SOVEREIGN — Monarca Supremo
  // Equilibrio perfecto + volumen alto + nivel élite
  // Condición: ningún stat supera al otro en más del 15% del gain total
  // + haber ganado al menos 150 puntos netos + nivel 45+
  if (
    spread < 0.15 &&
    totalGain >= 150 &&
    level >= 45 &&
    totalActivities >= 40
  ) {
    return "SOVEREIGN";
  }

  // MONARCH — Monarca
  // Dominio absoluto en un stat + rango A o S
  if (
    maxPct >= 0.68 &&
    rankScore >= 4 &&
    level >= 35 &&
    totalActivities >= 30
  ) {
    return "MONARCH";
  }

  // ════════════════════════════════════════════
  // RARO
  // ════════════════════════════════════════════

  // SHADOW — Soberano de las Sombras (Sung Jin-Woo)
  // Combina AGI + INT siendo el más ágil-inteligente
  // Requiere nivel 20+ → raro temprano, imposible sin progresión real
  if (
    agiPct >= 0.38 &&
    intPct >= 0.25 &&
    strPct >= 0.15 &&
    level >= 20 &&
    totalActivities >= 20
  ) {
    return "SHADOW";
  }

  // HEALER — Sanador
  // El equilibrio NO es pasivo: requiere racha larga + volumen
  // Represents consistent, diverse training lifestyle
  if (
    spread < 0.22 &&
    currentStreak >= 7 &&
    totalActivities >= 15
  ) {
    return "HEALER";
  }

  // BEAST — Bestia
  // Fuerza bruta + entrenamientos de alta intensidad sostenida
  if (
    strPct >= 0.52 &&
    recentAvgIntensity >= 8.0 &&
    totalActivities >= 20
  ) {
    return "BEAST";
  }

  // ASSASSIN — Asesino
  // Velocidad y agilidad extremas + entrenamientos explosivos
  if (
    agiPct >= 0.52 &&
    recentAvgIntensity >= 7.5 &&
    totalActivities >= 15
  ) {
    return "ASSASSIN";
  }

  // ════════════════════════════════════════════
  // BASE
  // ════════════════════════════════════════════

  if (strPct >= 0.52) return "FIGHTER";
  if (agiPct >= 0.52) return "RANGER";
  if (intPct >= 0.52) return "MAGE";

  // Sin dominancia clara: sigue siendo Novato
  return "NOVICE";
}
