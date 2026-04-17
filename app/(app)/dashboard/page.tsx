import Link from "next/link";
import { getDashboardData } from "@/lib/data/dashboard";
import { requireAuthUser } from "@/lib/auth/get-user";
import { RANK_CONFIG, CLASS_CONFIG } from "@/types";
import type { Rank, HunterClass } from "@/types";
import XPProgressBar    from "@/components/dashboard/XPProgressBar";
import StatsGrid        from "@/components/dashboard/StatsGrid";
import RecentActivities from "@/components/dashboard/RecentActivities";

export const metadata = { title: "Dashboard · Solo Leveling" };
// Renderizado dinámico por usuario — no cache estático
export const dynamic = "force-dynamic";

// ── Colores de rango ────────────────────────────────────────────
const RANK_BADGE: Record<Rank, string> = {
  E: "border-zinc-600   text-zinc-400",
  D: "border-green-500  text-green-400",
  C: "border-blue-500   text-blue-400",
  B: "border-purple-500 text-purple-400",
  A: "border-yellow-400 text-yellow-400",
  S: "border-red-500    text-red-400   shadow-red-500/30 shadow-md",
};

export default async function DashboardPage() {
  const { profile } = await requireAuthUser();
  const data = await getDashboardData(profile.id);

  // Estado vacío — primer uso antes de que exista el usuario demo
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <p className="text-4xl">🌀</p>
        <p className="text-zinc-400 text-sm">Inicializando tu perfil de Cazador…</p>
        <p className="text-zinc-600 text-xs">
          Ve a <Link href="/log" className="text-violet-400 underline">/log</Link> para registrar tu primera actividad.
        </p>
      </div>
    );
  }

  const { hunter, weeklyXP, totalActivities, recentActivities, statDistribution } = data;
  const rankConfig  = RANK_CONFIG[hunter.rank as Rank];
  const classConfig = CLASS_CONFIG[hunter.hunterClass as HunterClass];
  const badgeClass  = RANK_BADGE[hunter.rank as Rank];

  return (
    <div className="space-y-6 pb-6">

      {/* ── BANNER DEL CAZADOR ───────────────────────────────── */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 overflow-hidden">
        {/* Gradiente decorativo de fondo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]
            bg-[radial-gradient(ellipse_at_top_right,_#7c3aed_0%,_transparent_65%)]"
        />

        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar / clase */}
          <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-800 border border-zinc-700
            flex items-center justify-center text-3xl">
            {classConfig.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Rango + Nombre */}
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5
                rounded border ${badgeClass}`}>
                {rankConfig.label}
              </span>
              <h1 className="text-lg font-bold text-zinc-100 truncate">{hunter.name}</h1>
            </div>

            <p className="text-xs text-zinc-500">
              {classConfig.label} · {classConfig.description}
            </p>

            {/* Nivel */}
            <p className="text-xs text-zinc-600 mt-0.5">
              Nivel <span className="text-zinc-300 font-semibold">{hunter.level}</span>
            </p>
          </div>

          {/* XP total + Oro */}
          <div className="text-right shrink-0 space-y-1">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">XP Total</p>
              <p className="text-xl font-black text-zinc-100">
                {hunter.xpTotal.toLocaleString()}
              </p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
              <span>🪙</span>
              <span>{hunter.gold.toLocaleString()} G</span>
            </Link>
          </div>
        </div>

        {/* XP bar animada */}
        <div className="relative z-10 mt-4">
          <XPProgressBar
            percent={hunter.xpPercent}
            xpCurrent={hunter.xpCurrentLevel}
            xpNeeded={hunter.xpNeededThisLevel}
            level={hunter.level}
          />
        </div>
      </div>

      {/* ── MÉTRICAS RÁPIDAS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">XP esta semana</p>
          <p className="text-2xl font-black text-violet-400">
            {weeklyXP > 0 ? `+${weeklyXP.toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Actividades</p>
          <p className="text-2xl font-black text-zinc-100">{totalActivities}</p>
        </div>
      </div>

      {/* ── ESTADÍSTICAS ─────────────────────────────────────── */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">
          Estadísticas de Combate
        </h2>
        <StatsGrid
          strength={statDistribution.strength}
          agility={statDistribution.agility}
          intelligence={statDistribution.intelligence}
          total={statDistribution.total}
        />
      </section>

      {/* ── ACTIVIDADES RECIENTES ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Actividades Recientes
          </h2>
          {recentActivities.length > 0 && (
            <span className="text-xs text-zinc-600">{totalActivities} en total</span>
          )}
        </div>
        <RecentActivities activities={recentActivities} />
      </section>

      {/* ── CTA: REGISTRAR ───────────────────────────────────── */}
      <Link
        href="/log"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl
          bg-violet-600 hover:bg-violet-500 active:bg-violet-700
          text-white text-sm font-bold transition-colors"
      >
        ✦ Registrar Nueva Actividad
      </Link>
    </div>
  );
}
