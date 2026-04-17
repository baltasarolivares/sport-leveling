"use client";

import { useEffect, useState } from "react";

interface StatConfig {
  key: "strength" | "agility" | "intelligence";
  label: string;
  abbr: string;
  icon: string;
  bar: string;
  glow: string;
  text: string;
}

const STATS: StatConfig[] = [
  {
    key:   "strength",
    label: "Fuerza",
    abbr:  "STR",
    icon:  "⚔️",
    bar:   "from-red-600 to-orange-400",
    glow:  "shadow-red-500/20",
    text:  "text-red-400",
  },
  {
    key:   "agility",
    label: "Agilidad",
    abbr:  "AGI",
    icon:  "🏃",
    bar:   "from-emerald-600 to-teal-400",
    glow:  "shadow-emerald-500/20",
    text:  "text-emerald-400",
  },
  {
    key:   "intelligence",
    label: "Inteligencia",
    abbr:  "INT",
    icon:  "📖",
    bar:   "from-blue-600 to-indigo-400",
    glow:  "shadow-blue-500/20",
    text:  "text-blue-400",
  },
];

interface Props {
  strength: number;
  agility: number;
  intelligence: number;
  total: number;
}

function StatBar({ value, total, config }: { value: number; total: number; config: StatConfig }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 200 + STATS.indexOf(config) * 80);
    return () => clearTimeout(t);
  }, [pct, config]);

  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-lg ${config.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{config.abbr}</p>
            <p className="text-xs text-zinc-600">{config.label}</p>
          </div>
        </div>
        <span className={`text-2xl font-black ${config.text}`}>{value}</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${config.bar}`}
          style={{
            width:      `${width}%`,
            transition: "width 800ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <p className="text-right text-xs text-zinc-700 mt-1">{pct}% del total</p>
    </div>
  );
}

export default function StatsGrid({ strength, agility, intelligence, total }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map((cfg) => (
        <StatBar
          key={cfg.key}
          value={{ strength, agility, intelligence }[cfg.key]}
          total={total}
          config={cfg}
        />
      ))}
    </div>
  );
}
