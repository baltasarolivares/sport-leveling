"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ParsedActivity } from "@/lib/gemini/parse-activity";
import type { ApplyActivityResult } from "@/lib/xp-engine";
import type { ActivityCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS Y CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

type Stage = "idle" | "parsing" | "preview" | "confirming" | "reward";

const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; icon: string; color: string; border: string }
> = {
  STRENGTH:     { label: "Fuerza",        icon: "⚔️",  color: "text-red-400",    border: "border-red-500/40" },
  AGILITY:      { label: "Agilidad",      icon: "🏃",  color: "text-emerald-400", border: "border-emerald-500/40" },
  INTELLIGENCE: { label: "Inteligencia",  icon: "📖",  color: "text-blue-400",   border: "border-blue-500/40" },
  MIXED:        { label: "Mixto",         icon: "✦",   color: "text-violet-400", border: "border-violet-500/40" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function ParsedCard({
  parsed,
  onChange,
}: {
  parsed: ParsedActivity;
  onChange: (next: ParsedActivity) => void;
}) {
  const meta = CATEGORY_META[parsed.category];
  const CATEGORIES: ActivityCategory[] = ["STRENGTH", "AGILITY", "INTELLIGENCE", "MIXED"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${meta.border} bg-zinc-900/80 p-5 space-y-4`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{meta.icon}</span>
        <span className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>
          {meta.label} · Confirmá o edita los datos
        </span>
      </div>

      {/* Título */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Título</label>
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
          value={parsed.title}
          onChange={(e) => onChange({ ...parsed, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Duración */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Duración (min)</label>
          <input
            type="number"
            min={1}
            max={480}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
            value={parsed.durationMinutes}
            onChange={(e) =>
              onChange({ ...parsed, durationMinutes: Math.max(1, Number(e.target.value)) })
            }
          />
        </div>

        {/* Intensidad */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">
            Intensidad ({parsed.intensity}/10)
          </label>
          <input
            type="range"
            min={1}
            max={10}
            className="w-full mt-2 accent-violet-500"
            value={parsed.intensity}
            onChange={(e) =>
              onChange({ ...parsed, intensity: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Categoría</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            const active = cat === parsed.category;
            return (
              <button
                key={cat}
                onClick={() => onChange({ ...parsed, category: cat })}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  active
                    ? `${m.border} ${m.color} bg-zinc-800`
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                }`}
              >
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notas */}
      {parsed.notes && (
        <p className="text-xs text-zinc-500 italic border-t border-zinc-800 pt-3">
          💡 {parsed.notes}
        </p>
      )}
    </motion.div>
  );
}

function RewardOverlay({ result, onClose }: { result: ApplyActivityResult; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0 }}
        exit={{    scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 18, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-zinc-900 border border-violet-500/40 rounded-2xl p-7 space-y-5 text-center"
      >
        {/* Título */}
        {result.rankedUp ? (
          <>
            <div className="text-5xl">👑</div>
            <h2 className="text-2xl font-bold text-yellow-400">¡ASCENSO DE RANGO!</h2>
            <p className="text-zinc-400 text-sm">
              Has avanzado al <span className="text-yellow-400 font-bold">Rango {result.newRank}</span>
            </p>
          </>
        ) : result.leveledUp ? (
          <>
            <div className="text-5xl">⚡</div>
            <h2 className="text-2xl font-bold text-violet-400">¡NIVEL ALCANZADO!</h2>
            <p className="text-zinc-400 text-sm">
              {result.previousLevel} <span className="text-zinc-500">→</span>{" "}
              <span className="text-violet-300 font-bold">Nivel {result.newLevel}</span>
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl">✦</div>
            <h2 className="text-2xl font-bold text-zinc-100">Actividad Registrada</h2>
          </>
        )}

        {/* XP Principal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
          className="bg-zinc-800/60 rounded-xl py-4"
        >
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">XP Ganada</p>
          <p className="text-4xl font-black text-violet-400">
            +{result.xpGranted.toLocaleString()}
          </p>
          {result.bonusXP > 0 && (
            <p className="text-sm text-yellow-400 mt-1">
              +{result.bonusXP.toLocaleString()} bonus por logros
            </p>
          )}
        </motion.div>

        {/* Stats ganadas */}
        <div className="flex justify-center gap-4 text-sm">
          {result.strengthGain > 0 && (
            <span className="text-red-400">⚔️ +{result.strengthGain} STR</span>
          )}
          {result.agilityGain > 0 && (
            <span className="text-emerald-400">🏃 +{result.agilityGain} AGI</span>
          )}
          {result.intelligenceGain > 0 && (
            <span className="text-blue-400">📖 +{result.intelligenceGain} INT</span>
          )}
        </div>

        {/* Cambio de clase */}
        {result.classChanged && (
          <div className="flex items-center gap-3 bg-violet-400/10 border border-violet-400/20 rounded-lg px-3 py-2">
            <span className="text-xl">🏷️</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-violet-300">¡Clase Evolucionada!</p>
              <p className="text-xs text-zinc-500">
                {result.previousClass} → <span className="text-violet-400">{result.newHunterClass}</span>
              </p>
            </div>
          </div>
        )}

        {/* Aceleradores disparados */}
        {result.acceleratorsTriggered.length > 0 && (
          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Logros Desbloqueados</p>
            {result.acceleratorsTriggered.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2"
              >
                <span className="text-xl">{acc.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-yellow-400">{acc.name}</p>
                  <p className="text-xs text-zinc-500">{acc.description}</p>
                </div>
                <span className="ml-auto text-sm font-bold text-yellow-300">
                  +{acc.xpBonus.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors"
        >
          Continuar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function LogInterface({ userId }: { userId: string }) {
  const [stage,   setStage]   = useState<Stage>("idle");
  const [text,    setText]    = useState("");
  const [parsed,  setParsed]  = useState<ParsedActivity | null>(null);
  const [result,  setResult]  = useState<ApplyActivityResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Paso 1: parsear con Gemini ──────────────────────────────────
  async function handleParse() {
    if (!text.trim()) return;
    setError(null);
    setStage("parsing");

    try {
      const res  = await fetch("/api/ai/parse", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Error al analizar");
      setParsed(json.data as ParsedActivity);
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStage("idle");
    }
  }

  // ── Paso 2: confirmar y guardar ─────────────────────────────────
  async function handleConfirm() {
    if (!parsed) return;
    setError(null);
    setStage("confirming");

    try {
      const res  = await fetch("/api/activities", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        // userId lo lee la API desde la sesión — no se envía desde el cliente
        body:    JSON.stringify({ rawText: text, ...parsed }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Error al guardar");
      setResult(json.data as ApplyActivityResult);
      setStage("reward");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStage("preview");
    }
  }

  // ── Reset ───────────────────────────────────────────────────────
  function handleReset() {
    setText("");
    setParsed(null);
    setResult(null);
    setError(null);
    setStage("idle");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  // ── Tecla Enter (Shift+Enter = nueva línea, Enter = parsear) ────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && stage === "idle") {
      e.preventDefault();
      handleParse();
    }
  }

  return (
    <>
      {/* Reward overlay */}
      <AnimatePresence>
        {stage === "reward" && result && (
          <RewardOverlay result={result} onClose={handleReset} />
        )}
      </AnimatePresence>

      <div className="space-y-4 max-w-xl mx-auto">

        {/* ── Encabezado ───────────────────────────────────────── */}
        <div className="text-center space-y-1 pb-2">
          <h1 className="text-xl font-bold text-zinc-100">Registro de Actividad</h1>
          <p className="text-sm text-zinc-500">
            Escribe libremente. La IA extraerá los datos por ti.
          </p>
        </div>

        {/* ── Textarea de entrada ──────────────────────────────── */}
        <AnimatePresence>
          {(stage === "idle" || stage === "parsing") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={stage === "parsing"}
                placeholder={`¿Qué hiciste hoy, Cazador?\n\nEj: "Estudié 2 horas de algoritmos y luego hice una hora de pesas con intensidad alta"`}
                rows={5}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors disabled:opacity-50"
              />

              <button
                onClick={handleParse}
                disabled={!text.trim() || stage === "parsing"}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {stage === "parsing" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      ◈
                    </motion.span>
                    Analizando con IA…
                  </>
                ) : (
                  <>✦ Analizar con IA</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Preview + confirmación ───────────────────────────── */}
        <AnimatePresence>
          {(stage === "preview" || stage === "confirming") && parsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Texto original (colapsado) */}
              <p className="text-xs text-zinc-600 italic px-1 truncate">
                "{text}"
              </p>

              <ParsedCard
                parsed={parsed}
                onChange={(next) => setParsed(next)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStage("idle")}
                  disabled={stage === "confirming"}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors"
                >
                  ← Editar texto
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={stage === "confirming"}
                  className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {stage === "confirming" ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        ◈
                      </motion.span>
                      Guardando…
                    </>
                  ) : (
                    "✦ Confirmar y ganar XP"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ───────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
