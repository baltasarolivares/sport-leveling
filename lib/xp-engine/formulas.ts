import type { ActivityCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DE DISEÑO
// ─────────────────────────────────────────────────────────────────────────────

// XP por minuto a máxima intensidad (10/10)
const XP_PER_MINUTE_MAX = 12;

// Mínimo XP por minuto (intensidad 1/10)
const XP_PER_MINUTE_MIN = 2;

// Puntos de estadística por cada 60 min × intensidad
const STAT_POINTS_PER_HOUR_INTENSITY = 1;

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface XPResult {
  xpGranted: number;
  strengthGain: number;
  agilityGain: number;
  intelligenceGain: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FÓRMULA PRINCIPAL DE XP
//
// XP = duration_minutes × intensity_rate
//
// intensity_rate escala linealmente entre XP_PER_MINUTE_MIN (intensidad 1)
// y XP_PER_MINUTE_MAX (intensidad 10), con un bonus exponencial leve
// para intensidades muy altas (>= 8) que premia el esfuerzo extremo.
//
// Ejemplos:
//   60 min, intensidad 8  → ~576 XP
//   120 min, intensidad 7 → ~1008 XP
//   45 min, intensidad 9  → ~486 XP
// ─────────────────────────────────────────────────────────────────────────────

function intensityRate(intensity: number): number {
  // Normaliza 1–10 a 0–1
  const t = (Math.max(1, Math.min(10, intensity)) - 1) / 9;

  // Interpolación lineal entre min y max
  const linear = XP_PER_MINUTE_MIN + t * (XP_PER_MINUTE_MAX - XP_PER_MINUTE_MIN);

  // Bonus exponencial leve para intensidad >= 8 (elite effort)
  const eliteBonus = intensity >= 8 ? (intensity - 7) * 0.5 : 0;

  return linear + eliteBonus;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTRIBUCIÓN DE PUNTOS DE ESTADÍSTICA
//
// La actividad genera un pool de puntos y los distribuye según la categoría:
//   STRENGTH     → 80% STR, 20% AGI
//   AGILITY      → 80% AGI, 20% STR
//   INTELLIGENCE → 100% INT
//   MIXED        → 34% STR, 33% AGI, 33% INT
// ─────────────────────────────────────────────────────────────────────────────

function distributeStats(
  totalPoints: number,
  category: ActivityCategory
): Pick<XPResult, "strengthGain" | "agilityGain" | "intelligenceGain"> {
  const p = totalPoints;

  switch (category) {
    case "STRENGTH":
      return {
        strengthGain:     Math.round(p * 0.8),
        agilityGain:      Math.round(p * 0.2),
        intelligenceGain: 0,
      };
    case "AGILITY":
      return {
        strengthGain:     Math.round(p * 0.2),
        agilityGain:      Math.round(p * 0.8),
        intelligenceGain: 0,
      };
    case "INTELLIGENCE":
      return {
        strengthGain:     0,
        agilityGain:      0,
        intelligenceGain: p,
      };
    case "MIXED":
    default:
      return {
        strengthGain:     Math.round(p * 0.34),
        agilityGain:      Math.round(p * 0.33),
        intelligenceGain: Math.round(p * 0.33),
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

export function calculateActivityXP(
  durationMinutes: number,
  intensity: number,
  category: ActivityCategory
): XPResult {
  const clampedDuration = Math.max(1, durationMinutes);
  const clampedIntensity = Math.max(1, Math.min(10, intensity));

  const xpGranted = Math.round(clampedDuration * intensityRate(clampedIntensity));

  // Puntos de stat: 1 punto por cada 60 min × (intensidad / 5)
  const rawPoints = (clampedDuration / 60) * clampedIntensity * STAT_POINTS_PER_HOUR_INTENSITY;
  const totalStatPoints = Math.max(1, Math.round(rawPoints));

  const statGains = distributeStats(totalStatPoints, category);

  return { xpGranted, ...statGains };
}
