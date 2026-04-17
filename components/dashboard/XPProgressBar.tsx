"use client";

import { useEffect, useState } from "react";

interface Props {
  percent: number;       // 0–100
  xpCurrent: number;
  xpNeeded: number;
  level: number;
}

export default function XPProgressBar({ percent, xpCurrent, xpNeeded, level }: Props) {
  // Arranca en 0 y anima hasta el valor real al montar
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), 120);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-zinc-500">
          Nivel <span className="text-zinc-300 font-semibold">{level}</span>
          <span className="text-zinc-600 mx-1">→</span>
          <span className="text-zinc-300 font-semibold">{level + 1}</span>
        </span>
        <span className="text-zinc-500">
          <span className="text-zinc-300">{xpCurrent.toLocaleString()}</span>
          {" / "}
          {xpNeeded.toLocaleString()} XP
        </span>
      </div>

      <div className="relative h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
        {/* Brillo de fondo animado */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-700/30 to-purple-500/10"
          style={{ width: `${width}%`, transition: "width 900ms cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* Barra principal */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 to-purple-400"
          style={{ width: `${width}%`, transition: "width 900ms cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* Destello en el extremo */}
        {width > 2 && (
          <div
            className="absolute top-0 bottom-0 w-1 rounded-full bg-white/30 blur-sm"
            style={{
              left:       `calc(${width}% - 2px)`,
              transition: "left 900ms cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        )}
      </div>

      <p className="text-right text-xs text-zinc-600">{percent}%</p>
    </div>
  );
}
