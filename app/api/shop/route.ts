import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// GET /api/shop
// Devuelve todos los items con su estado (disponible / propietario)
// y el balance de oro del usuario autenticado.
// ─────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [items, hunter] = await Promise.all([
    prisma.item.findMany({
      orderBy: [{ rank: "asc" }, { price: "asc" }],
      include: { owner: { select: { id: true, name: true } } },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { gold: true },
    }),
  ]);

  return NextResponse.json({ ok: true, data: { items, gold: hunter.gold } });
}

// ─────────────────────────────────────────────
// POST /api/shop  { itemId }
// Compra un item: cobra oro, transfiere propiedad.
// Reglas:
//   · El item debe estar disponible (ownerId == null)
//   · El usuario debe tener oro suficiente
//   · Inventario máximo: 4 items en total (equipados o no)
//   · Máximo 1 item S-Rank en inventario
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ error: "itemId requerido" }, { status: 400 });

  try {
    const [item, hunter] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemId } }),
      prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          gold: true,
          ownedItems: { select: { id: true, rank: true, equipped: true } },
        },
      }),
    ]);

    if (!item)              return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    if (item.ownerId)       return NextResponse.json({ error: "Este item ya tiene dueño" }, { status: 409 });
    if (hunter.gold < item.price) return NextResponse.json({ error: `Oro insuficiente. Necesitas ${item.price}G, tienes ${hunter.gold}G` }, { status: 402 });

    // Límite de inventario
    if (hunter.ownedItems.length >= 4) {
      return NextResponse.json(
        { error: "Inventario lleno (máximo 4 items). Vende uno para continuar." },
        { status: 409 }
      );
    }

    // Límite S-Rank: solo 1 en inventario
    if (item.rank === "S" && hunter.ownedItems.some((i) => i.rank === "S")) {
      return NextResponse.json(
        { error: "Ya posees un item S-Rank. Solo se puede tener uno." },
        { status: 409 }
      );
    }

    // Transacción: cobrar oro + transferir item
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data:  { gold: { decrement: item.price } },
      }),
      prisma.item.update({
        where: { id: itemId },
        data:  { ownerId: user.id, equipped: false },
      }),
    ]);

    const newGold = hunter.gold - item.price;
    return NextResponse.json({
      ok: true,
      data: { item, goldSpent: item.price, newGold },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
