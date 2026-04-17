"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AllRankings, Leaderboard, RankedHunter, RankingCategory, MyPositions } from "@/lib/data/rankings";
import { RANK_CONFIG, CLASS_CONFIG } from "@/types";
import type { Rank, HunterClass } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE TABS
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: RankingCategory; label: string; icon: string; color: string }[] = [
  { key: "xp",           label: "Global",  icon: "⚡", color: "text-violet-400" },
  { key: "strength",     label: "Fuerza",  icon: "⚔️", color: "text-red-400"    },
  { key: "agility",      label: "Agilidad", icon: "🏃", color: "text-emerald-400" },
  { key: "intelligence", label: "Mente",   icon: "📖", color: "text-blue-400"   },
];

const RANK_BADGE_COLOR: Record<Rank, string> = {
  E: "text-zinc-400  border-zinc-600",
  D: "text-green-400 border-green-600",
  C: "text-blue-400  border-blue-600",
  B: "text-purple-400 border-purple-600",
  A: "text-yellow-400 border-yellow-500",
  S: "text-red-400   border-red-500",
};

const POSITION_STYLE: Record<number, { medal: string; text: string; bg: string }> = {
  1: { medal: "🥇", text: "text-yellow-400 font-black", bg: "bg-yellow-400/5 border-yellow-400/20" },
  2: { medal: "🥈", text: "text-zinc-300  font-bold",   bg: "bg-zinc-700/30 border-zinc-600/30" },
  3: { medal: "🥉", text: "text-orange-400 font-bold",  bg: "bg-orange-400/5 border-orange-400/20" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MONARCH CARD
// ─────────────────────────────────────────────────────────────────────────────

function MonarchCard({ hunter, monarchTitle, unit, isMe }: {
  hunter: RankedHunter;
  monarchTitle: string;
  unit: string;
  isMe: boolean;
}) {
  const rankCfg  = RANK_CONFIG[hunter.rank];
  const classCfg = CLASS_CONFIG[hunter.hunterClass];
  const badgeCls = RANK_BADGE_COLOR[hunter.rank];

  return (
    <div className={`relative rounded-2xl border overflow-hidden p-5 ${
      isMe
        ? "border-violet-500/50 bg-violet-950/30"
        : "border-yellow-400/25 bg-zinc-900/70"
    }`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${
          isMe
            ? "bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.08)_0%,_transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_top,_rgba(250,204,21,0.07)_0%,_transparent_70%)]"
        }`}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-16 w-16 rounded-xl bg-zinc-800 border border-zinc-700
            flex items-center justify-center text-3xl">
            {classCfg.icon}
          </div>
          <span className="absolute -top-3 -right-2 text-xl">👑</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
            isMe ? "text-violet-400/80" : "text-yellow-400/80"
          }`}>
            {isMe ? "⚡ Tú — " : ""}{monarchTitle}
          </p>
          <h2 className="text-lg font-black text-zinc-100 truncate">{hunter.name}</h2>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${badgeCls}`}>
              {rankCfg.label}
            </span>
            <span className="text-xs text-zinc-500">
              {classCfg.label} · Nivel {hunter.level}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className={`text-2xl font-black ${isMe ? "text-violet-400" : "text-yellow-400"}`}>
            {hunter.value.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{unit}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILA DEL LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────

function LeaderboardRow({ hunter, unit, isMe }: {
  hunter: RankedHunter;
  unit: string;
  isMe: boolean;
}) {
  const style    = POSITION_STYLE[hunter.position];
  const classCfg = CLASS_CONFIG[hunter.hunterClass];
  const badgeCls = RANK_BADGE_COLOR[hunter.rank];

  const myBg = "border-violet-500/30 bg-violet-950/20";
  const bg   = style ? style.bg : "border-zinc-800/60 bg-zinc-900/40";

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${isMe ? myBg : bg}`}>
      {/* Posición */}
      <div className="w-7 shrink-0 text-center">
        {style
          ? <span className="text-base">{style.medal}</span>
          : <span className="text-sm text-zinc-600 font-bold">{hunter.position}</span>
        }
      </div>

      {/* Clase / avatar */}
      <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-800 border border-zinc-700
        flex items-center justify-center text-sm">
        {classCfg.icon}
      </div>

      {/* Nombre + rango */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm truncate ${
            isMe ? "text-violet-300 font-bold" : (style ? style.text : "text-zinc-300 font-medium")
          }`}>
            {hunter.name}
          </p>
          {isMe && (
            <span className="text-[9px] font-black px-1.5 py-px rounded bg-violet-600 text-white shrink-0">
              TÚ
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1 py-px rounded border ${badgeCls}`}>
            {hunter.rank}
          </span>
          <span className="text-[10px] text-zinc-600">Nv. {hunter.level}</span>
        </div>
      </div>

      {/* Valor */}
      <p className={`text-sm font-bold shrink-0 ${
        isMe ? "text-violet-400" : (style ? style.text : "text-zinc-400")
      }`}>
        {hunter.value.toLocaleString()}
        <span className="text-[10px] font-normal text-zinc-600 ml-1">{unit}</span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE "TU POSICIÓN" cuando el usuario no está en top 20
// ─────────────────────────────────────────────────────────────────────────────

function MyPositionBadge({ position, total, unit }: {
  position: number;
  total: number;
  unit: string;
}) {
  if (position <= 20) return null; // ya aparece en la lista
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-violet-500/30
      bg-violet-950/20 px-3 py-2.5">
      <div className="w-7 text-center text-sm text-zinc-600 font-bold">{position}</div>
      <div className="flex-1">
        <p className="text-xs text-zinc-400">
          Tu posición — <span className="text-violet-400 font-semibold">#{position}</span> de {total} cazadores
        </p>
        <p className="text-[10px] text-zinc-600 mt-0.5">
          Sigue registrando {unit === "XP" ? "actividades" : `actividades de ${unit}`} para subir
        </p>
      </div>
      <span className="text-[9px] font-black px-1.5 py-px rounded bg-violet-600 text-white">TÚ</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL DE UN LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────

function LeaderboardPanel({ board, myId, myPosition, totalHunters }: {
  board: Leaderboard;
  myId: string | null;
  myPosition: number | null;
  totalHunters: number;
}) {
  if (!board.monarch) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
        <p className="text-3xl mb-3">🌑</p>
        <p className="text-sm text-zinc-500">Aún no hay Cazadores registrados.</p>
        <p className="text-xs text-zinc-600 mt-1">Registra actividades para aparecer aquí.</p>
      </div>
    );
  }

  const rest = board.top.slice(1);
  const monarchIsMe = myId === board.monarch.id;

  return (
    <div className="space-y-4">
      <MonarchCard
        hunter={board.monarch}
        monarchTitle={board.monarchTitle}
        unit={board.unit}
        isMe={monarchIsMe}
      />

      {rest.length > 0 && (
        <div className="space-y-1.5">
          {rest.map((h) => (
            <LeaderboardRow key={h.id} hunter={h} unit={board.unit} isMe={myId === h.id} />
          ))}
        </div>
      )}

      {/* Badge fuera del top 20 */}
      {myPosition && (
        <MyPositionBadge
          position={myPosition}
          total={totalHunters}
          unit={board.unit}
        />
      )}

      {rest.length === 0 && !myPosition && (
        <p className="text-center text-xs text-zinc-600 py-4">
          Solo hay un Cazador activo. ¡Sé el primero en desafiarlo!
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function RankingsTabs({
  rankings,
  totalHunters,
  myId,
  myPositions,
}: {
  rankings: AllRankings;
  totalHunters: number;
  myId: string | null;
  myPositions: MyPositions;
}) {
  const [active, setActive] = useState<RankingCategory>("xp");
  const board = rankings[active];
  const myPosition = myPositions[active];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-zinc-100">Rankings</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            {totalHunters} {totalHunters === 1 ? "Cazador activo" : "Cazadores activos"}
          </p>
        </div>
        <div className="text-2xl">🏆</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const pos = myPositions[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-lg bg-zinc-800"
                  transition={{ type: "spring", damping: 22, stiffness: 350 }}
                />
              )}
              <span className="relative z-10 text-base">{tab.icon}</span>
              <span className={`relative z-10 ${isActive ? tab.color : ""}`}>{tab.label}</span>
              {pos && pos <= 20 && (
                <span className="relative z-10 text-[8px] text-violet-400 font-black">#{pos}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel activo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{    opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <LeaderboardPanel
            board={board}
            myId={myId}
            myPosition={myPosition}
            totalHunters={totalHunters}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
