import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// POST /api/items/[id]/equip
// Body: { action: "equip" | "unequip" }
//
// Equipar: máximo 4 items equipados, máximo 1 S-Rank equipado.
// Desequipar: siempre permitido.
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: itemId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { action } = await req.json();
  if (action !== "equip" && action !== "unequip") {
    return NextResponse.json({ error: 'action debe ser "equip" o "unequip"' }, { status: 400 });
  }

  try {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    if (item.ownerId !== user.id) return NextResponse.json({ error: "No eres el dueño de este item" }, { status: 403 });

    if (action === "unequip") {
      await prisma.item.update({ where: { id: itemId }, data: { equipped: false } });
      return NextResponse.json({ ok: true, data: { itemId, equipped: false } });
    }

    // Verificar límites para equipar
    const equippedItems = await prisma.item.findMany({
      where: { ownerId: user.id, equipped: true },
      select: { id: true, rank: true },
    });

    if (equippedItems.length >= 4) {
      return NextResponse.json(
        { error: "Ya tienes 4 items equipados. Desequipa uno antes." },
        { status: 409 }
      );
    }

    if (item.rank === "S" && equippedItems.some((i) => i.rank === "S")) {
      return NextResponse.json(
        { error: "Solo puedes tener 1 item S-Rank equipado." },
        { status: 409 }
      );
    }

    await prisma.item.update({ where: { id: itemId }, data: { equipped: true } });
    return NextResponse.json({ ok: true, data: { itemId, equipped: true } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
