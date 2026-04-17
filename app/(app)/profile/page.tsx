import { requireAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";
import { logout } from "@/lib/auth/actions";
import { RANK_CONFIG, CLASS_CONFIG } from "@/types";
import type { Rank, HunterClass } from "@/types";
import { xpThresholdForLevel, xpThresholdForNextLevel } from "@/lib/xp-engine";

export const metadata = { title: "Perfil · Solo Leveling" };
export const dynamic = "force-dynamic";

const CATEGORY_STYLE = {
  STRENGTH:     { bar: "bg-red-500",     label: "Fuerza",       icon: "⚔️" },
  AGILITY:      { bar: "bg-emerald-500", label: "Agilidad",     icon: "🏃" },
  INTELLIGENCE: { bar: "bg-blue-500",    label: "Inteligencia", icon: "📖" },
  MIXED:        { bar: "bg-violet-500",  label: "Mixto",        icon: "✦"  },
};

const RARITY_STYLE = {
  common:    { label: "Común",      cls: "text-zinc-400  border-zinc-600"    },
  uncommon:  { label: "Inusual",    cls: "text-green-400 border-green-600"   },
  rare:      { label: "Raro",       cls: "text-blue-400  border-blue-600"    },
  legendary: { label: "Legendario", cls: "text-yellow-400 border-yellow-500" },
};

function relativeDate(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `Hace ${diff} días`;
}

export default async function ProfilePage() {
  const { profile } = await requireAuthUser();

  // Actividades recientes
  const recentActivities = await prisma.activity.findMany({
    where:   { userId: profile.id },
    orderBy: { createdAt: "desc" },
    take:    10,
  });

  const rank  = RANK_CONFIG[profile.rank as Rank];
  const cls   = CLASS_CONFIG[profile.hunterClass as HunterClass];
  const rarity = RARITY_STYLE[cls.rarity];

  const xpStart    = xpThresholdForLevel(profile.level);
  const xpNext     = xpThresholdForNextLevel(profile.level);
  const xpInLevel  = profile.xpTotal - xpStart;
  const xpNeeded   = xpNext - xpStart;
  const xpPct      = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  const totalStat = profile.strength + profile.agility + profile.intelligence;

  return (
    <div className="space-y-6 pb-6">

      {/* ── CABECERA ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500 via-transparent to-transparent pointer-events-none"
        />

        <div className="flex items-start gap-5 relative z-10">
          {/* Avatar / clase */}
          <div className="h-20 w-20 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-4xl shrink-0">
            {cls.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${rank.color} border-current`}>
                {rank.label}
              </span>
              <h1 className="text-xl font-bold text-zinc-100 truncate">{profile.name}</h1>
            </div>

            {/* Clase + rareza */}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-zinc-300">{cls.label}</p>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-px rounded border ${rarity.cls}`}>
                {rarity.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{cls.description}</p>
            <p className="text-sm text-zinc-600 mt-1">
              Nivel <span className="text-zinc-300 font-semibold">{profile.level}</span>
              {" · "}Cazador desde{" "}
              {profile.createdAt.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">XP Total</p>
            <p className="text-2xl font-bold text-zinc-100">{profile.xpTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Barra XP */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Progreso al siguiente nivel</span>
            <span>{xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-700"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <p className="text-right text-xs text-zinc-600 mt-1">{xpPct}%</p>
        </div>
      </div>

      {/* ── CÓMO GANAR ESTA CLASE ────────────────────────────── */}
      {cls.rarity !== "common" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex gap-3">
          <span className="text-xl shrink-0">{cls.icon}</span>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Clase {cls.label} — desbloqueada
            </p>
            <p className="text-xs text-zinc-500">{cls.unlockHint}</p>
          </div>
        </div>
      )}

      {/* ── ESTADÍSTICAS ─────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
          Estadísticas de Combate
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { label: "Fuerza",       value: profile.strength,     style: CATEGORY_STYLE.STRENGTH     },
            { label: "Agilidad",     value: profile.agility,      style: CATEGORY_STYLE.AGILITY      },
            { label: "Inteligencia", value: profile.intelligence,  style: CATEGORY_STYLE.INTELLIGENCE },
          ] as const).map((stat) => {
            const pct = totalStat > 0 ? Math.round((stat.value / totalStat) * 100) : 33;
            return (
              <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{stat.style.icon} {stat.label}</span>
                  <span className="text-xl font-bold text-zinc-100">{stat.value}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full ${stat.style.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-zinc-600 text-right">{pct}% del total</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ACTIVIDADES RECIENTES ────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
          Actividades Recientes
        </h2>
        {recentActivities.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-10 text-center">
            <p className="text-2xl mb-2">🌑</p>
            <p className="text-sm text-zinc-500">Aún no hay actividades registradas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((act) => {
              const style = CATEGORY_STYLE[act.category as keyof typeof CATEGORY_STYLE];
              return (
                <div key={act.id} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${style.bar} bg-opacity-20`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{act.title}</p>
                    <p className="text-xs text-zinc-500">
                      {act.durationMinutes} min · Intensidad {act.intensity}/10 · {relativeDate(act.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-violet-400">+{act.xpGranted} XP</p>
                    <p className="text-xs text-zinc-600">{style.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CERRAR SESIÓN ────────────────────────────────────── */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full py-3 rounded-xl border border-zinc-800 text-zinc-500
            hover:border-zinc-600 hover:text-zinc-300 text-sm font-medium transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
