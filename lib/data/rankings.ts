import { prisma } from "@/lib/prisma";
import type { Rank, HunterClass } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export type RankingCategory = "xp" | "strength" | "agility" | "intelligence";

export interface RankedHunter {
  position: number;
  id: string;
  name: string;
  hunterClass: HunterClass;
  rank: Rank;
  level: number;
  value: number;   // El campo por el que se ordena
}

export interface Leaderboard {
  category:    RankingCategory;
  title:       string;
  monarchTitle: string;
  unit:        string;
  monarch:     RankedHunter | null;
  top:         RankedHunter[];   // top 20, incluye al monarca
}

export interface MyPositions {
  xp:           number | null;
  strength:     number | null;
  agility:      number | null;
  intelligence: number | null;
}

export interface AllRankings {
  xp:           Leaderboard;
  strength:     Leaderboard;
  agility:      Leaderboard;
  intelligence: Leaderboard;
  totalHunters: number;
  myPositions:  MyPositions;
  myId:         string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  RankingCategory,
  { title: string; monarchTitle: string; unit: string; field: string }
> = {
  xp:           { title: "Clasificación Global",   monarchTitle: "Monarca del Poder",         unit: "XP",  field: "xpTotal"      },
  strength:     { title: "Clasificación de Fuerza", monarchTitle: "Monarca de la Fuerza",      unit: "STR", field: "strength"     },
  agility:      { title: "Clasificación de Agilidad", monarchTitle: "Monarca de la Agilidad", unit: "AGI", field: "agility"      },
  intelligence: { title: "Clasificación de Inteligencia", monarchTitle: "Monarca de la Mente", unit: "INT", field: "intelligence" },
};

async function queryLeaderboard(
  category: RankingCategory,
  orderField: "xpTotal" | "strength" | "agility" | "intelligence"
): Promise<Leaderboard> {
  const meta = CATEGORY_META[category];

  const rows = await prisma.user.findMany({
    orderBy: { [orderField]: "desc" },
    take:    20,
    select: {
      id:          true,
      name:        true,
      hunterClass: true,
      rank:        true,
      level:       true,
      xpTotal:     true,
      strength:    true,
      agility:     true,
      intelligence: true,
    },
  });

  const top: RankedHunter[] = rows.map((u, i) => ({
    position:    i + 1,
    id:          u.id,
    name:        u.name,
    hunterClass: u.hunterClass as HunterClass,
    rank:        u.rank as Rank,
    level:       u.level,
    value:       u[orderField],
  }));

  return {
    category,
    title:        meta.title,
    monarchTitle: meta.monarchTitle,
    unit:         meta.unit,
    monarch:      top[0] ?? null,
    top,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PRINCIPAL — carga los 4 leaderboards en paralelo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la posición global del usuario en una categoría.
 * Retorna null si no hay userId o si no se encuentra el usuario.
 */
async function getMyPosition(
  userId: string,
  field: "xpTotal" | "strength" | "agility" | "intelligence"
): Promise<number | null> {
  const me = await prisma.user.findUnique({
    where:  { id: userId },
    select: { xpTotal: true, strength: true, agility: true, intelligence: true },
  });
  if (!me) return null;
  const myValue = me[field];
  const above = await prisma.user.count({ where: { [field]: { gt: myValue } } });
  return above + 1;
}

export async function getAllRankings(userId?: string | null): Promise<AllRankings> {
  const [xp, strength, agility, intelligence, totalHunters] = await Promise.all([
    queryLeaderboard("xp",           "xpTotal"),
    queryLeaderboard("strength",     "strength"),
    queryLeaderboard("agility",      "agility"),
    queryLeaderboard("intelligence", "intelligence"),
    prisma.user.count(),
  ]);

  let myPositions: MyPositions = { xp: null, strength: null, agility: null, intelligence: null };

  if (userId) {
    const [posXP, posStr, posAgi, posInt] = await Promise.all([
      getMyPosition(userId, "xpTotal"),
      getMyPosition(userId, "strength"),
      getMyPosition(userId, "agility"),
      getMyPosition(userId, "intelligence"),
    ]);
    myPositions = { xp: posXP, strength: posStr, agility: posAgi, intelligence: posInt };
  }

  return { xp, strength, agility, intelligence, totalHunters, myPositions, myId: userId ?? null };
}
