import type { Rank } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TABLA DE NIVELES (1 – 100)
//
// XP necesario para SUBIR desde el nivel N al nivel N+1:
//
//   xpForLevel(n) = BASE * n * GROWTH^(n-1)
//
//   BASE   = 1 000 XP (coste del primer nivel)
//   GROWTH = 1.08     (crecimiento del 8% por nivel)
//
// Ejemplos de coste por nivel:
//   Nivel  1 →  2:   1 000 XP
//   Nivel  5 →  6:   1 469 XP
//   Nivel 10 → 11:   2 159 XP
//   Nivel 25 → 26:   6 848 XP
//   Nivel 50 → 51:  46 902 XP
//   Nivel 99 →100: 990 000 XP (aprox)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 1_000;
const GROWTH = 1.08;
const MAX_LEVEL = 100;

/** XP requerido para pasar del nivel `n` al `n+1` */
export function xpForLevel(n: number): number {
  return Math.round(BASE * n * Math.pow(GROWTH, n - 1));
}

// Tabla acumulativa: xpCumulative[n] = XP total para ALCANZAR el nivel n
// Índice 0 no se usa; xpCumulative[1] = 0 (empiezas en nivel 1 con 0 XP).
const xpCumulative: number[] = new Array(MAX_LEVEL + 1).fill(0);

for (let lvl = 2; lvl <= MAX_LEVEL; lvl++) {
  xpCumulative[lvl] = xpCumulative[lvl - 1] + xpForLevel(lvl - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// RANGOS
//
// Cada rango abarca un rango de niveles. El rango se deriva del nivel,
// no del XP total directamente — así el nivel es siempre la métrica central.
// ─────────────────────────────────────────────────────────────────────────────

interface RankBand {
  rank: Rank;
  minLevel: number;
  maxLevel: number;
}

const RANK_BANDS: RankBand[] = [
  { rank: "E", minLevel: 1,  maxLevel: 10  },
  { rank: "D", minLevel: 11, maxLevel: 25  },
  { rank: "C", minLevel: 26, maxLevel: 45  },
  { rank: "B", minLevel: 46, maxLevel: 65  },
  { rank: "A", minLevel: 66, maxLevel: 85  },
  { rank: "S", minLevel: 86, maxLevel: 100 },
];

// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

/** Nivel que corresponde a un XP acumulado dado. */
export function getLevelForXP(xpTotal: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xpCumulative[level + 1] <= xpTotal) {
    level++;
  }
  return level;
}

/** Rango que corresponde a un nivel dado. */
export function getRankForLevel(level: number): Rank {
  for (const band of RANK_BANDS) {
    if (level >= band.minLevel && level <= band.maxLevel) {
      return band.rank;
    }
  }
  return "S";
}

/** XP total necesario para alcanzar el siguiente nivel. */
export function xpThresholdForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return xpCumulative[MAX_LEVEL];
  return xpCumulative[currentLevel + 1];
}

/** XP total necesario para alcanzar el nivel `n`. */
export function xpThresholdForLevel(n: number): number {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, n));
  return xpCumulative[clamped];
}

export { MAX_LEVEL, RANK_BANDS };
