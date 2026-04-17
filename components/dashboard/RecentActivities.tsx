"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string }> = {
  STRENGTH:     { icon: "⚔️", color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  AGILITY:      { icon: "🏃", color: "text-emerald-400",  bg: "bg-emerald-500/10 border-emerald-500/20" },
  INTELLIGENCE: { icon: "📖", color: "text-blue-400",     bg: "bg-blue-500/10 border-blue-500/20" },
  MIXED:        { icon: "✦",  color: "text-violet-400",   bg: "bg-violet-500/10 border-violet-500/20" },
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)     return "Hace un momento";
  if (diff < 3600)   return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return `Hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
  return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

interface Activity {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  intensity: number;
  xpGranted: number;
  goldGranted: number;
  strengthGain: number;
  agilityGain: number;
  intelligenceGain: number;
  createdAt: Date;
}

export default function RecentActivities({ activities: initial }: { activities: Activity[] }) {
  const router = useRouter();
  const [activities, setActivities] = useState(initial);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setActivities((prev) => prev.filter((a) => a.id !== id));
      router.refresh(); // recalcula stats del dashboard
    } catch {
      // silencioso — el item permanece
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
        <p className="text-3xl mb-3">⚔️</p>
        <p className="text-sm text-zinc-500">Aún no hay actividades.</p>
        <p className="text-xs text-zinc-600 mt-1">Registra tu primera misión para comenzar a subir de nivel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((act, i) => {
        const meta    = CATEGORY_META[act.category] ?? CATEGORY_META.MIXED;
        const gains   = [
          act.strengthGain     > 0 && `+${act.strengthGain} STR`,
          act.agilityGain      > 0 && `+${act.agilityGain} AGI`,
          act.intelligenceGain > 0 && `+${act.intelligenceGain} INT`,
        ].filter(Boolean).join(" · ");
        const isConfirming = confirmId  === act.id;
        const isDeleting   = deletingId === act.id;

        return (
          <div
            key={act.id}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-3 transition-opacity"
            style={{ animationDelay: `${i * 60}ms`, opacity: isDeleting ? 0.4 : 1 }}
          >
            <div className="flex items-center gap-3">
              {/* Ícono de categoría */}
              <div className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center text-base ${meta.bg}`}>
                {meta.icon}
              </div>

              {/* Nombre + detalles */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{act.title}</p>
                <p className="text-xs text-zinc-600">
                  {act.durationMinutes} min · Int. {act.intensity}/10
                  {gains ? ` · ${gains}` : ""}
                </p>
              </div>

              {/* XP + oro + tiempo + borrar */}
              <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                <p className={`text-sm font-bold ${meta.color}`}>+{act.xpGranted.toLocaleString()} XP</p>
                {act.goldGranted > 0 && (
                  <p className="text-xs text-amber-400 font-semibold">+{act.goldGranted}G</p>
                )}
                <p className="text-xs text-zinc-600">{timeAgo(act.createdAt)}</p>
              </div>

              {/* Botón eliminar */}
              {!isConfirming ? (
                <button
                  onClick={() => setConfirmId(act.id)}
                  className="ml-1 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Revertir actividad"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              ) : null}
            </div>

            {/* Confirmación inline */}
            {isConfirming && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <p className="text-xs text-red-300 flex-1">
                  ¿Revertir? Se restará XP, oro y stats.
                </p>
                <button
                  onClick={() => setConfirmId(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(act.id)}
                  disabled={isDeleting}
                  className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "…" : "Revertir"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
