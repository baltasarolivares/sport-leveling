// ─────────────────────────────────────────────────────────────────────────────
// ACELERADORES (Logros / Achievements)
//
// Son hitos que inyectan XP masiva cuando el cazador los alcanza por primera vez.
// Se evalúan DESPUÉS de guardar la actividad en DB.
//
// Estructura de un Accelerator:
//   id          → clave única (se guarda en DB para evitar doble disparo)
//   name        → nombre visible
//   description → descripción del logro
//   xpBonus     → XP extra que otorga
//   icon        → emoji representativo
//   check()     → función pura que evalúa si se cumple la condición
// ─────────────────────────────────────────────────────────────────────────────

export interface AcceleratorContext {
  totalActivities: number;       // Actividades registradas hasta ahora (incluida la actual)
  currentStreak: number;         // Días consecutivos con al menos 1 actividad
  currentLevel: number;          // Nivel actual del cazador
  strength: number;              // Stat de fuerza actual
  agility: number;               // Stat de agilidad actual
  intelligence: number;          // Stat de inteligencia actual
  lastActivity: {
    durationMinutes: number;
    intensity: number;
    category: string;
  };
}

export interface Accelerator {
  id: string;
  name: string;
  description: string;
  xpBonus: number;
  icon: string;
  check: (ctx: AcceleratorContext) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE ACELERADORES
// ─────────────────────────────────────────────────────────────────────────────

export const ACCELERATORS: Accelerator[] = [
  // ── Primeras veces ──────────────────────────────────────────────
  {
    id: "first_step",
    name: "Primer Paso",
    description: "Registra tu primera actividad.",
    xpBonus: 500,
    icon: "👣",
    check: (ctx) => ctx.totalActivities === 1,
  },
  {
    id: "ten_activities",
    name: "Aspirante a Cazador",
    description: "Registra 10 actividades.",
    xpBonus: 2_000,
    icon: "📋",
    check: (ctx) => ctx.totalActivities >= 10,
  },
  {
    id: "fifty_activities",
    name: "Cazador Consagrado",
    description: "Registra 50 actividades.",
    xpBonus: 8_000,
    icon: "⚡",
    check: (ctx) => ctx.totalActivities >= 50,
  },

  // ── Rachas ──────────────────────────────────────────────────────
  {
    id: "streak_3",
    name: "Racha de Fuego",
    description: "Entrena 3 días consecutivos.",
    xpBonus: 800,
    icon: "🔥",
    check: (ctx) => ctx.currentStreak >= 3,
  },
  {
    id: "streak_7",
    name: "Semana del Cazador",
    description: "Entrena 7 días consecutivos.",
    xpBonus: 3_000,
    icon: "🗓️",
    check: (ctx) => ctx.currentStreak >= 7,
  },
  {
    id: "streak_30",
    name: "Soberano de la Constancia",
    description: "Entrena 30 días consecutivos.",
    xpBonus: 15_000,
    icon: "👑",
    check: (ctx) => ctx.currentStreak >= 30,
  },

  // ── Hitos de nivel ──────────────────────────────────────────────
  {
    id: "reach_level_10",
    name: "Graduado de Rango E",
    description: "Alcanza el nivel 10.",
    xpBonus: 5_000,
    icon: "🥉",
    check: (ctx) => ctx.currentLevel >= 10,
  },
  {
    id: "reach_level_25",
    name: "Ascenso a Rango C",
    description: "Alcanza el nivel 25.",
    xpBonus: 10_000,
    icon: "🥈",
    check: (ctx) => ctx.currentLevel >= 25,
  },
  {
    id: "reach_level_50",
    name: "Élite del Cazador",
    description: "Alcanza el nivel 50.",
    xpBonus: 30_000,
    icon: "🥇",
    check: (ctx) => ctx.currentLevel >= 50,
  },

  // ── Hitos de estadísticas ───────────────────────────────────────
  {
    id: "strength_50",
    name: "Portador de Hierro",
    description: "Alcanza 50 puntos de Fuerza.",
    xpBonus: 4_000,
    icon: "⚔️",
    check: (ctx) => ctx.strength >= 50,
  },
  {
    id: "agility_50",
    name: "Viento del Desierto",
    description: "Alcanza 50 puntos de Agilidad.",
    xpBonus: 4_000,
    icon: "🌪️",
    check: (ctx) => ctx.agility >= 50,
  },
  {
    id: "intelligence_50",
    name: "Estratega Arcano",
    description: "Alcanza 50 puntos de Inteligencia.",
    xpBonus: 4_000,
    icon: "📖",
    check: (ctx) => ctx.intelligence >= 50,
  },

  // ── Hitos de esfuerzo extremo ───────────────────────────────────
  {
    id: "max_intensity",
    name: "Al Límite",
    description: "Completa una actividad con intensidad máxima (10/10).",
    xpBonus: 1_500,
    icon: "💥",
    check: (ctx) => ctx.lastActivity.intensity >= 10,
  },
  {
    id: "marathon_session",
    name: "Maratón de Hierro",
    description: "Registra una sesión de 3 horas o más.",
    xpBonus: 3_000,
    icon: "🏋️",
    check: (ctx) => ctx.lastActivity.durationMinutes >= 180,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVALUADOR
//
// Recibe el contexto actual y la lista de IDs ya desbloqueados,
// devuelve los aceleradores que se disparan por primera vez.
// ─────────────────────────────────────────────────────────────────────────────

export function evaluateAccelerators(
  ctx: AcceleratorContext,
  alreadyUnlocked: string[]
): Accelerator[] {
  const unlocked = new Set(alreadyUnlocked);
  return ACCELERATORS.filter(
    (acc) => !unlocked.has(acc.id) && acc.check(ctx)
  );
}
