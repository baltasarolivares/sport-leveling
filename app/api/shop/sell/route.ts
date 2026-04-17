import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// POST /api/shop/sell  { itemId }
// Vende un item: devuelve 50% del precio original en oro,
// el item vuelve a estar disponible en la tienda (ownerId = null).
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ error: "itemId requerido" }, { status: 400 });

  try {
    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!item) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    if (item.ownerId !== user.id) return NextResponse.json({ error: "No eres el dueño de este item" }, { status: 403 });

    const goldReturned = Math.floor(item.price * 0.5);

    await prisma.$transaction([
      prisma.item.update({
        where: { id: itemId },
        data:  { ownerId: null, equipped: false },
      }),
      prisma.user.update({
        where: { id: user.id },
        data:  { gold: { increment: goldReturned } },
      }),
    ]);

    const hunter = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { gold: true },
    });

    return NextResponse.json({
      ok: true,
      data: {
        itemName: item.name,
        goldReturned,
        newGold: hunter.gold,
        message: `Vendiste "${item.name}" y recuperaste ${goldReturned}G (50% de ${item.price}G). El item está disponible en la tienda.`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
