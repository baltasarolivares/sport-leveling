import Link from "next/link";
import { CLASS_CONFIG } from "@/types";
import type { HunterClass } from "@/types";

const RARITY_STYLE = {
  common:    { label: "Común",     cls: "text-zinc-400  border-zinc-600"    },
  uncommon:  { label: "Inusual",   cls: "text-green-400 border-green-600"   },
  rare:      { label: "Raro",      cls: "text-blue-400  border-blue-600"    },
  legendary: { label: "Legendario", cls: "text-yellow-400 border-yellow-500" },
};

// Orden de presentación
const CLASS_ORDER: HunterClass[] = [
  "NOVICE", "FIGHTER", "RANGER", "MAGE",
  "ASSASSIN", "BEAST", "HEALER", "SHADOW",
  "MONARCH", "SOVEREIGN",
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="max-w-sm mx-auto space-y-8">

        {/* Cabecera */}
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-violet-400 uppercase mb-2">
            Sistema de Cazadores
          </p>
          <h1 className="text-2xl font-black tracking-wider text-zinc-100 uppercase mb-1">
            ◈ Has Despertado
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Tu clase no se elige — se <span className="text-violet-400 font-semibold">gana</span>.
            Registra tus actividades y el sistema detectará tu especialización real.
          </p>
        </div>

        {/* Reglas del sistema */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Cómo funciona</p>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>⚔️ <span className="text-zinc-300">Registra actividades</span> con texto libre — la IA las analiza</p>
            <p>📈 <span className="text-zinc-300">Tus stats suben</span> según lo que hagas (STR / AGI / INT)</p>
            <p>🏷️ <span className="text-zinc-300">Tu clase evoluciona</span> automáticamente con cada registro</p>
            <p>👑 <span className="text-zinc-300">Las clases raras</span> se desbloquean con patrones excepcionales</p>
          </div>
        </div>

        {/* Clases disponibles */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Clases del Sistema
          </p>
          {CLASS_ORDER.map((key) => {
            const cls = CLASS_CONFIG[key];
            const rarity = RARITY_STYLE[cls.rarity];
            return (
              <div key={key}
                className="flex items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
                <span className="text-xl mt-0.5 shrink-0">{cls.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-200">{cls.label}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-px rounded border ${rarity.cls}`}>
                      {rarity.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{cls.unlockHint}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-full py-4 rounded-xl
            bg-violet-600 hover:bg-violet-500 text-white font-black text-sm
            tracking-widest uppercase transition-colors shadow-lg shadow-violet-500/25"
        >
          ✦ Comenzar Ascenso
        </Link>

        <p className="text-center text-xs text-zinc-700">
          Empieza como Novato — tu primera actividad revelará el camino.
        </p>
      </div>
    </div>
  );
}
