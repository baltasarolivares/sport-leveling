"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Rank = "E" | "D" | "C" | "B" | "A" | "S";
type ItemType = "WEAPON" | "ARMOR" | "ACCESSORY";

interface Item {
  id: string;
  name: string;
  description: string;
  lore: string | null;
  rank: Rank;
  itemType: ItemType;
  price: number;
  xpMultiplierStr: number;
  xpMultiplierAgi: number;
  xpMultiplierInt: number;
  xpMultiplierAll: number;
  strengthBonus: number;
  agilityBonus: number;
  intelligenceBonus: number;
  ownerId: string | null;
  equipped: boolean;
  owner: { id: string; name: string } | null;
}

// ─────────────────────────────────────────────
// CONFIGURACIÓN VISUAL
// ─────────────────────────────────────────────

const RANK_STYLE: Record<Rank, { badge: string; border: string; glow: string; label: string }> = {
  E: { badge: "border-zinc-600 text-zinc-400 bg-zinc-800/50",   border: "border-zinc-700",          glow: "",                        label: "Rango E" },
  D: { badge: "border-green-500/60 text-green-400 bg-green-500/10", border: "border-green-500/20",  glow: "shadow-green-500/10",      label: "Rango D" },
  C: { badge: "border-blue-500/60 text-blue-400 bg-blue-500/10",    border: "border-blue-500/20",   glow: "shadow-blue-500/10",       label: "Rango C" },
  B: { badge: "border-purple-500/60 text-purple-400 bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/20",  label: "Rango B" },
  A: { badge: "border-yellow-400/60 text-yellow-400 bg-yellow-400/10", border: "border-yellow-400/30", glow: "shadow-yellow-400/20", label: "Rango A" },
  S: { badge: "border-red-500/70 text-red-400 bg-red-500/10",     border: "border-red-500/40",       glow: "shadow-red-500/30 shadow-md", label: "Rango S" },
};

const TYPE_ICON: Record<ItemType, string> = {
  WEAPON:    "⚔️",
  ARMOR:     "🛡️",
  ACCESSORY: "💍",
};

const RANKS: Rank[] = ["E", "D", "C", "B", "A", "S"];

function formatEffect(item: Item): string {
  const parts: string[] = [];
  if (item.xpMultiplierAll > 0)  parts.push(`+${Math.round(item.xpMultiplierAll * 100)}% XP`);
  if (item.xpMultiplierStr > 0)  parts.push(`+${Math.round(item.xpMultiplierStr * 100)}% STR XP`);
  if (item.xpMultiplierAgi > 0)  parts.push(`+${Math.round(item.xpMultiplierAgi * 100)}% AGI XP`);
  if (item.xpMultiplierInt > 0)  parts.push(`+${Math.round(item.xpMultiplierInt * 100)}% INT XP`);
  if (item.strengthBonus > 0)    parts.push(`+${item.strengthBonus} STR`);
  if (item.agilityBonus > 0)     parts.push(`+${item.agilityBonus} AGI`);
  if (item.intelligenceBonus > 0) parts.push(`+${item.intelligenceBonus} INT`);
  return parts.join(" · ") || "Sin efectos";
}

// ─────────────────────────────────────────────
// TARJETA DE ITEM
// ─────────────────────────────────────────────

function ItemCard({
  item, userId, gold, onAction,
}: {
  item: Item;
  userId: string;
  gold: number;
  onAction: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmSell, setConfirmSell] = useState(false);

  const style     = RANK_STYLE[item.rank];
  const isOwned   = item.ownerId === userId;
  const available = item.ownerId === null;
  const canAfford = gold >= item.price;

  async function post(url: string, body: object) {
    setError(null);
    const res  = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); return false; }
    return true;
  }

  function refresh() {
    startTransition(() => { router.refresh(); onAction(); });
  }

  async function handleBuy() {
    if (await post("/api/shop", { itemId: item.id })) refresh();
  }
  async function handleSell() {
    if (await post("/api/shop/sell", { itemId: item.id })) { setConfirmSell(false); refresh(); }
  }
  async function handleEquip() {
    if (await post(`/api/items/${item.id}/equip`, { action: "equip" })) refresh();
  }
  async function handleUnequip() {
    if (await post(`/api/items/${item.id}/equip`, { action: "unequip" })) refresh();
  }

  return (
    <div className={`rounded-xl border bg-zinc-900/60 p-4 space-y-3 shadow-sm ${style.border} ${style.glow} ${isPending ? "opacity-50" : ""}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center text-xl ${style.badge}`}>
          {TYPE_ICON[item.itemType]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${style.badge}`}>
              {style.label}
            </span>
            {item.equipped && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-violet-500/40 text-violet-400 bg-violet-500/10">
                Equipado
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-zinc-100 mt-1 leading-tight">{item.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
        </div>
      </div>

      {/* Efectos */}
      <div className="text-xs text-violet-300 font-medium bg-violet-500/5 border border-violet-500/10 rounded-lg px-3 py-2">
        {formatEffect(item)}
      </div>

      {/* Lore */}
      {item.lore && (
        <p className="text-[10px] text-zinc-600 italic leading-relaxed">
          &ldquo;{item.lore}&rdquo;
        </p>
      )}

      {/* Precio */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-amber-400">
          🪙 {item.price.toLocaleString()} G
        </span>
        {!available && !isOwned && item.owner && (
          <span className="text-[10px] text-zinc-600">
            Equipado por <span className="text-zinc-500">{item.owner.name}</span>
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="space-y-2">
        {/* Disponible en tienda */}
        {available && (
          <button
            onClick={handleBuy}
            disabled={isPending || !canAfford}
            className={`w-full py-2 rounded-lg text-xs font-bold transition-colors
              ${canAfford
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
                : "bg-zinc-800/50 border border-zinc-700 text-zinc-600 cursor-not-allowed"
              } disabled:opacity-50`}
          >
            {isPending ? "…" : canAfford ? "Comprar" : `Faltan ${(item.price - gold).toLocaleString()} G`}
          </button>
        )}

        {/* De tu propiedad */}
        {isOwned && (
          <div className="flex gap-2">
            {item.equipped ? (
              <button onClick={handleUnequip} disabled={isPending}
                className="flex-1 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-colors disabled:opacity-50">
                {isPending ? "…" : "Desequipar"}
              </button>
            ) : (
              <button onClick={handleEquip} disabled={isPending}
                className="flex-1 py-2 rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-bold transition-colors disabled:opacity-50">
                {isPending ? "…" : "Equipar"}
              </button>
            )}
            {!confirmSell ? (
              <button onClick={() => setConfirmSell(true)} disabled={isPending}
                className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:text-red-400 hover:border-red-500/30 text-xs transition-colors disabled:opacity-50"
                title={`Vender por ${Math.floor(item.price * 0.5).toLocaleString()} G`}>
                Vender
              </button>
            ) : (
              <div className="flex-1 flex gap-1">
                <button onClick={() => setConfirmSell(false)}
                  className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-500 text-xs transition-colors">
                  No
                </button>
                <button onClick={handleSell} disabled={isPending}
                  className="flex-1 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold transition-colors disabled:opacity-50">
                  {isPending ? "…" : `+${Math.floor(item.price * 0.5).toLocaleString()} G`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ocupado por otro */}
        {!available && !isOwned && (
          <div className="py-2 text-center text-xs text-zinc-600 border border-zinc-800 rounded-lg bg-zinc-900/40">
            No disponible
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export default function ShopInterface({
  initialItems, initialGold, userId,
}: {
  initialItems: Item[];
  initialGold: number;
  userId: string;
}) {
  const router = useRouter();
  const [activeRank, setActiveRank] = useState<Rank>("E");
  const [filter, setFilter]         = useState<"ALL" | "MINE" | "AVAILABLE">("ALL");

  const filtered = initialItems.filter((item) => {
    if (item.rank !== activeRank) return false;
    if (filter === "MINE")      return item.ownerId === userId;
    if (filter === "AVAILABLE") return item.ownerId === null;
    return true;
  });

  const myItemsCount   = initialItems.filter((i) => i.ownerId === userId).length;
  const equippedCount  = initialItems.filter((i) => i.ownerId === userId && i.equipped).length;

  function refresh() { router.refresh(); }

  return (
    <div className="space-y-5 pb-6">

      {/* ── HEADER: ORO + INVENTARIO ── */}
      <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/60 p-5 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]
          bg-[radial-gradient(ellipse_at_top_right,_#f59e0b_0%,_transparent_65%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Oro disponible</p>
            <p className="text-3xl font-black text-amber-400">
              🪙 {initialGold.toLocaleString()} G
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Inventario</p>
            <p className="text-lg font-black text-zinc-200">{myItemsCount}<span className="text-zinc-600 text-sm font-medium">/4</span></p>
            <p className="text-[10px] text-zinc-500">{equippedCount} equipado{equippedCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {myItemsCount >= 4 && (
          <p className="relative z-10 mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            ⚠ Inventario lleno — vende un item para poder comprar otro.
          </p>
        )}
      </div>

      {/* ── TABS DE RANGO ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {RANKS.map((rank) => {
          const s         = RANK_STYLE[rank];
          const count     = initialItems.filter((i) => i.rank === rank).length;
          const available = initialItems.filter((i) => i.rank === rank && i.ownerId === null).length;
          return (
            <button
              key={rank}
              onClick={() => setActiveRank(rank)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeRank === rank
                  ? `${s.badge} ${s.glow}`
                  : "border-zinc-800 text-zinc-600 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              {rank}
              <span className="ml-1 text-[9px] font-normal opacity-60">{available}/{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── FILTROS ── */}
      <div className="flex gap-2">
        {(["ALL", "AVAILABLE", "MINE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f
                ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-700"
            }`}
          >
            {f === "ALL" ? "Todos" : f === "AVAILABLE" ? "Disponibles" : "Mi inventario"}
          </button>
        ))}
      </div>

      {/* ── GRID DE ITEMS ── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-12 text-center">
          <p className="text-3xl mb-3">🛒</p>
          <p className="text-sm text-zinc-500">
            {filter === "MINE" ? "No tienes items de este rango." : "No hay items disponibles en este rango."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              userId={userId}
              gold={initialGold}
              onAction={refresh}
            />
          ))}
        </div>
      )}

      {/* ── LEYENDA ── */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 space-y-1">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Reglas de la tienda</p>
        <p className="text-xs text-zinc-600">• Cada item existe en una sola copia en todo el servidor.</p>
        <p className="text-xs text-zinc-600">• Inventario máximo: <span className="text-zinc-400">4 items</span>, solo <span className="text-zinc-400">1 de Rango S</span>.</p>
        <p className="text-xs text-zinc-600">• Al vender recuperas el <span className="text-zinc-400">50%</span> del precio original.</p>
        <p className="text-xs text-zinc-600">• Los items equipados modifican tu XP y estadísticas en tiempo real.</p>
      </div>
    </div>
  );
}
