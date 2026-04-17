import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/dungeons/[id]
 * Body: { action: "cancel" }
 *
 * Cancela una dungeon OPEN. Solo el creador puede hacerlo.
 * No requiere reversión de XP: unirse a una dungeon no otorga XP,
 * solo completarla lo hace.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dungeonId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action !== "cancel") {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    const dungeon = await prisma.dungeon.findUnique({
      where: { id: dungeonId },
      include: { participants: { select: { userId: true } } },
    });

    if (!dungeon) {
      return NextResponse.json({ error: "Dungeon no encontrada" }, { status: 404 });
    }

    if (dungeon.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Solo el creador puede cerrar la dungeon" },
        { status: 403 }
      );
    }

    if (dungeon.status !== "OPEN") {
      return NextResponse.json(
        { error: "Solo se pueden cancelar dungeons abiertas" },
        { status: 409 }
      );
    }

    await prisma.dungeon.update({
      where: { id: dungeonId },
      data:  { status: "CANCELLED" },
    });

    return NextResponse.json({
      ok: true,
      data: {
        dungeonId,
        participantsCount: dungeon.participants.length,
        message: "Dungeon cerrada. Nadie pierde XP ya que no se había completado.",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
