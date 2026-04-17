"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityCategory } from "@/types";
import { CLASS_CONFIG } from "@/types";
import type { HunterClass } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  user: { id: string; name: string; rank: string; hunterClass: string };
}

interface Dungeon {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  category: ActivityCategory;
  xpBonus: number;
  maxParticipants: number;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  creator: { id: string; name: string; rank: string; hunterClass: string };
  participants: Participant[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<ActivityCategory, { icon: string; label: string; color: string; border: string }> = {
  STRENGTH:     { icon: "⚔️", label: "Fuerza",        color: "text-red-400",     border: "border-red-500/30"     },
  AGILITY:      { icon: "🏃", label: "Agilidad",      color: "text-emerald-400", border: "border-emerald-500/30" },
  INTELLIGENCE: { icon: "📖", label: "Inteligencia",  color: "text-blue-400",    border: "border-blue-500/30"    },
  MIXED:        { icon: "✦",  label: "Mixto",         color: "text-violet-400",  border: "border-violet-500/30"  },
};

const STATUS_META = {
  OPEN:      { label: "Abierta",    cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  COMPLETED: { label: "Completada", cls: "text-zinc-500    border-zinc-700       bg-zinc-800/50"    },
  CANCELLED: { label: "Cancelada",  cls: "text-red-400     border-red-500/40     bg-red-500/10"     },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA DE DUNGEON
// ─────────────────────────────────────────────────────────────────────────────

function DungeonCard({
  dungeon, userId, onAction,
}: {
  dungeon: Dungeon;
  userId: string | null;
  onAction: () => void;
}) {
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const catMeta  = CATEGORY_META[dungeon.category];
  const statMeta = STATUS_META[dungeon.status];
  const isCreator     = userId === dungeon.creator.id;
  const isParticipant = dungeon.participants.some((p) => p.user.id === userId);
  const isFull        = dungeon.participants.length >= dungeon.maxParticipants;

  async function handleCancel() {
    setLoading(true); setMsg(null);
    const res  = await fetch(`/api/dungeons/${dungeon.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const json = await res.json();
    setLoading(false);
    setConfirmCancel(false);
    if (!res.ok) { setMsg(json.error); return; }
    onAction();
  }

  async function handleJoin() {
    setLoading(true); setMsg(null);
    const res  = await fetch(`/api/dungeons/${dungeon.id}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg(json.error); return; }
    onAction();
  }

  async function handleComplete() {
    setLoading(true); setMsg(null);
    const res  = await fetch(`/api/dungeons/${dungeon.id}/complete`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg(json.error); return; }
    setMsg(`✦ ¡Dungeon completada! ${dungeon.participants.length} cazador${dungeon.participants.length !== 1 ? "es" : ""} recibieron +${dungeon.xpBonus.toLocaleString()} XP`);
    onAction();
  }

  return (
    <div className={`rounded-xl border bg-zinc-900/60 p-4 space-y-3 ${
      dungeon.status === "COMPLETED" ? "opacity-60" : catMeta.border
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-800 border border-zinc-700
          flex items-center justify-center text-xl">
          {catMeta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-zinc-100 truncate">{dungeon.title}</h3>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${statMeta.cls}`}>
              {statMeta.label}
            </span>
          </div>
          {dungeon.description && (
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{dungeon.description}</p>
          )}
        </div>
      </div>

      {/* Detalles */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>🗓 {formatDate(dungeon.scheduledAt)}</span>
        <span className={catMeta.color}>⚡ +{dungeon.xpBonus.toLocaleString()} XP</span>
        <span>👥 {dungeon.participants.length}/{dungeon.maxParticipants}</span>
      </div>

      {/* Participantes */}
      {dungeon.participants.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dungeon.participants.map((p) => {
            const cls = CLASS_CONFIG[p.user.hunterClass as HunterClass];
            return (
              <span key={p.id}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                {cls.icon} {p.user.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Creador */}
      <p className="text-[10px] text-zinc-600">
        Creada por <span className="text-zinc-500">{dungeon.creator.name}</span>
      </p>

      {/* Acciones */}
      {dungeon.status === "OPEN" && (
        <div className="flex gap-2">
          {!isParticipant && !isFull && (
            <button onClick={handleJoin} disabled={loading || !userId}
              className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500
                disabled:opacity-40 text-white text-xs font-bold transition-colors">
              {loading ? "…" : "⚔ Unirse a la Incursión"}
            </button>
          )}
          {isParticipant && !isCreator && (
            <p className="flex-1 py-2 text-center text-xs text-emerald-400 font-medium">
              ✓ Ya estás en esta incursión
            </p>
          )}
          {isCreator && (
            <button onClick={handleComplete} disabled={loading}
              className="flex-1 py-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10
                hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold transition-colors
                disabled:opacity-40">
              {loading ? "…" : "👑 Completar y Distribuir XP"}
            </button>
          )}
          {isCreator && !confirmCancel && (
            <button onClick={() => setConfirmCancel(true)} disabled={loading}
              className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50
                hover:bg-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-400
                text-xs transition-colors disabled:opacity-40"
              title="Cerrar dungeon">
              ✕
            </button>
          )}
          {!isParticipant && isFull && (
            <p className="flex-1 py-2 text-center text-xs text-zinc-500">Dungeon llena</p>
          )}
        </div>
      )}

      {/* Confirmación cancelar dungeon */}
      {confirmCancel && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          <p className="text-xs text-red-300 flex-1">¿Cerrar esta dungeon? Los participantes no pierden XP.</p>
          <button onClick={() => setConfirmCancel(false)}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded transition-colors">
            No
          </button>
          <button onClick={handleCancel} disabled={loading}
            className="text-xs font-bold text-red-400 bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors disabled:opacity-50">
            {loading ? "…" : "Cerrar"}
          </button>
        </div>
      )}

      {/* Mensaje de feedback */}
      <AnimatePresence>
        {msg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-emerald-400 text-center py-1">
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO DE CREACIÓN
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: ActivityCategory[] = ["STRENGTH", "AGILITY", "INTELLIGENCE", "MIXED"];

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading]  = useState(false);
  const [error,   setError]    = useState<string | null>(null);
  const [form, setForm] = useState({
    title:           "",
    description:     "",
    scheduledAt:     "",
    category:        "MIXED" as ActivityCategory,
    xpBonus:         1000,
    maxParticipants: 10,
  });

  function field<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) { setError("Título y fecha son requeridos"); return; }
    setLoading(true); setError(null);
    const res  = await fetch("/api/dungeons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error); return; }
    setForm({ title: "", description: "", scheduledAt: "", category: "MIXED", xpBonus: 1000, maxParticipants: 10 });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit}
      className="rounded-xl border border-violet-500/30 bg-zinc-900/60 p-5 space-y-4">
      <h3 className="text-sm font-bold text-violet-400">✦ Nueva Incursión</h3>

      <div className="space-y-3">
        <input value={form.title} onChange={(e) => field("title", e.target.value)}
          placeholder="Nombre de la incursión"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
            text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />

        <textarea value={form.description} onChange={(e) => field("description", e.target.value)}
          placeholder="Descripción (opcional)" rows={2}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
            text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none transition-colors" />

        <input type="datetime-local" value={form.scheduledAt}
          onChange={(e) => field("scheduledAt", e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
            text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors
            [color-scheme:dark]" />

        {/* Categoría */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            return (
              <button key={cat} type="button" onClick={() => field("category", cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  form.category === cat
                    ? `${m.border} ${m.color} bg-zinc-800`
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                }`}>
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-600 uppercase tracking-wider">
              Bonus XP ({form.xpBonus.toLocaleString()})
            </label>
            <input type="range" min={100} max={10000} step={100}
              value={form.xpBonus} onChange={(e) => field("xpBonus", Number(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-600 uppercase tracking-wider">
              Máx. participantes ({form.maxParticipants})
            </label>
            <input type="range" min={2} max={50}
              value={form.maxParticipants} onChange={(e) => field("maxParticipants", Number(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">⚠ {error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500
          disabled:opacity-40 text-white text-sm font-bold transition-colors">
        {loading ? "Creando…" : "Abrir Dungeon"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function DungeonInterface({ userId }: { userId: string }) {
  const [dungeons,  setDungeons]  = useState<Dungeon[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [tab,       setTab]       = useState<"open" | "completed">("open");

  // Cargar dungeons
  const loadDungeons = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/dungeons");
    const json = await res.json();
    if (json.ok) setDungeons(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadDungeons(); }, [loadDungeons]);

  const open      = dungeons.filter((d) => d.status === "OPEN");
  const completed = dungeons.filter((d) => d.status === "COMPLETED");
  const shown     = tab === "open" ? open : completed;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-zinc-100">Dungeons</h1>
          <p className="text-xs text-zinc-600 mt-0.5">Incursiones grupales con XP extra</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            showForm
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
              : "bg-violet-600 hover:bg-violet-500 text-white"
          }`}>
          {showForm ? "✕ Cancelar" : "+ Crear"}
        </button>
      </div>

      {/* Formulario de creación */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <CreateForm onCreated={() => { setShowForm(false); loadDungeons(); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
        {(["open", "completed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-400"
            }`}>
            {tab === t && (
              <motion.div layoutId="dungeon-tab"
                className="absolute inset-0 rounded-lg bg-zinc-800"
                transition={{ type: "spring", damping: 22, stiffness: 350 }} />
            )}
            <span className="relative z-10">
              {t === "open" ? `⚔ Abiertas (${open.length})` : `✓ Completadas (${completed.length})`}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="py-16 text-center text-zinc-600 text-sm">Cargando incursiones…</div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-14 text-center">
          <p className="text-3xl mb-3">{tab === "open" ? "🌑" : "📜"}</p>
          <p className="text-sm text-zinc-500">
            {tab === "open" ? "No hay dungeons abiertas." : "Aún no se han completado incursiones."}
          </p>
          {tab === "open" && (
            <p className="text-xs text-zinc-600 mt-1">Crea la primera y convoca a tu party.</p>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} className="space-y-3">
            {shown.map((d) => (
              <DungeonCard key={d.id} dungeon={d} userId={userId} onAction={loadDungeons} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
