// ─────────────────────────────────────────────
// ENUMS (espejados de Prisma para uso en cliente)
// ─────────────────────────────────────────────

export type Rank = "E" | "D" | "C" | "B" | "A" | "S";

export type HunterClass =
  | "NOVICE"
  | "FIGHTER"
  | "RANGER"
  | "MAGE"
  | "ASSASSIN"
  | "BEAST"
  | "HEALER"
  | "SHADOW"
  | "MONARCH"
  | "SOVEREIGN";

export type ActivityCategory =
  | "STRENGTH"
  | "AGILITY"
  | "INTELLIGENCE"
  | "MIXED";

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE RANGOS
// ─────────────────────────────────────────────

export interface RankConfig {
  label: string;
  color: string;          // Color primario Tailwind
  glow: string;           // Clase de sombra/brillo
  xpRequired: number;     // XP total para alcanzar este rango
  levelRange: [number, number];
}

export const RANK_CONFIG: Record<Rank, RankConfig> = {
  E: {
    label: "Rango E",
    color: "text-zinc-400",
    glow: "",
    xpRequired: 0,
    levelRange: [1, 10],
  },
  D: {
    label: "Rango D",
    color: "text-green-400",
    glow: "shadow-green-400/30",
    xpRequired: 10_000,
    levelRange: [11, 25],
  },
  C: {
    label: "Rango C",
    color: "text-blue-400",
    glow: "shadow-blue-400/30",
    xpRequired: 50_000,
    levelRange: [26, 45],
  },
  B: {
    label: "Rango B",
    color: "text-purple-400",
    glow: "shadow-purple-400/30",
    xpRequired: 150_000,
    levelRange: [46, 65],
  },
  A: {
    label: "Rango A",
    color: "text-yellow-400",
    glow: "shadow-yellow-400/30",
    xpRequired: 400_000,
    levelRange: [66, 85],
  },
  S: {
    label: "Rango S",
    color: "text-red-400",
    glow: "shadow-red-500/50",
    xpRequired: 1_000_000,
    levelRange: [86, 100],
  },
};

export const CLASS_CONFIG: Record<
  HunterClass,
  { label: string; icon: string; description: string; rarity: "common" | "uncommon" | "rare" | "legendary"; unlockHint: string }
> = {
  NOVICE:   {
    label: "Novato",
    icon: "🌱",
    description: "Recién despertado. Registra actividades para descubrir tu clase.",
    rarity: "common",
    unlockHint: "Clase inicial",
  },
  FIGHTER:  {
    label: "Guerrero",
    icon: "⚔️",
    description: "Maestro de la Fuerza. Domina en entrenamiento físico de fuerza.",
    rarity: "common",
    unlockHint: "+55% de tus ganancias en Fuerza",
  },
  RANGER:   {
    label: "Explorador",
    icon: "🏹",
    description: "Maestro de la Agilidad. Velocidad, resistencia y movimiento.",
    rarity: "common",
    unlockHint: "+55% de tus ganancias en Agilidad",
  },
  MAGE:     {
    label: "Mago",
    icon: "📖",
    description: "Maestro de la Inteligencia. Estudio, trabajo mental y conocimiento.",
    rarity: "common",
    unlockHint: "+55% de tus ganancias en Inteligencia",
  },
  ASSASSIN: {
    label: "Asesino",
    icon: "🗡️",
    description: "Velocidad letal. Agilidad extrema combinada con intensidad explosiva.",
    rarity: "uncommon",
    unlockHint: "AGI >52% + intensidad media ≥7.5 + 15 actividades",
  },
  BEAST:    {
    label: "Bestia",
    icon: "🦁",
    description: "Fuerza bruta sin límites. Entrenamientos de máxima exigencia.",
    rarity: "uncommon",
    unlockHint: "STR >52% + intensidad media ≥8.0 + 20 actividades",
  },
  HEALER:   {
    label: "Sanador",
    icon: "💚",
    description: "Equilibrio perfecto de cuerpo y mente. Consistencia como arma.",
    rarity: "rare",
    unlockHint: "Stats equilibrados + racha ≥7 días + 15 actividades",
  },
  SHADOW:   {
    label: "Soberano de las Sombras",
    icon: "🌑",
    description: "La clase de Sung Jin-Woo. Combina AGI e INT en perfecto dominio.",
    rarity: "rare",
    unlockHint: "AGI +INT combinados + nivel ≥20 + 20 actividades",
  },
  MONARCH:  {
    label: "Monarca",
    icon: "👑",
    description: "Dominio absoluto. Una stat llevada al extremo con rango A o S.",
    rarity: "legendary",
    unlockHint: "Un stat >68% + Rango A/S + nivel ≥35",
  },
  SOVEREIGN: {
    label: "Monarca Supremo",
    icon: "✨",
    description: "El ser más completo. Equilibrio total en el nivel máximo.",
    rarity: "legendary",
    unlockHint: "Stats equilibrados perfectos + 150 pts ganados + nivel ≥45",
  },
};

// ─────────────────────────────────────────────
// TIPOS DE DATOS
// ─────────────────────────────────────────────

export interface HunterProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  xpTotal: number;
  xpToNext: number;
  rank: Rank;
  hunterClass: HunterClass;
  strength: number;
  agility: number;
  intelligence: number;
  createdAt: Date;
}

export interface ActivityRecord {
  id: string;
  title: string;
  category: ActivityCategory;
  durationMinutes: number;
  intensity: number;
  xpGranted: number;
  strengthGain: number;
  agilityGain: number;
  intelligenceGain: number;
  createdAt: Date;
}
