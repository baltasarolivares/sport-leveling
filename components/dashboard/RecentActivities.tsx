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
  strengthGain: number;
  agilityGain: number;
  intelligenceGain: number;
  createdAt: Date;
}

export default function RecentActivities({ activities }: { activities: Activity[] }) {
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
        const meta   = CATEGORY_META[act.category] ?? CATEGORY_META.MIXED;
        const gains  = [
          act.strengthGain     > 0 && `+${act.strengthGain} STR`,
          act.agilityGain      > 0 && `+${act.agilityGain} AGI`,
          act.intelligenceGain > 0 && `+${act.intelligenceGain} INT`,
        ].filter(Boolean).join(" · ");

        return (
          <div
            key={act.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
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

            {/* XP + tiempo */}
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${meta.color}`}>+{act.xpGranted.toLocaleString()} XP</p>
              <p className="text-xs text-zinc-600">{timeAgo(act.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
