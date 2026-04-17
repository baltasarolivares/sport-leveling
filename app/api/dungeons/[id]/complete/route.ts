import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { grantXP } from "@/lib/xp-engine/grant-xp";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dungeonId } = await params;

  // Autenticación desde sesión
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const requesterId = user.id;

  try {
    const dungeon = await prisma.dungeon.findUnique({
      where:   { id: dungeonId },
      include: { participants: { select: { userId: true } } },
    });

    if (!dungeon)
      return NextResponse.json({ error: "Dungeon no encontrada" }, { status: 404 });
    if (dungeon.creatorId !== requesterId)
      return NextResponse.json({ error: "Solo el creador puede completar la dungeon" }, { status: 403 });
    if (dungeon.status !== "OPEN")
      return NextResponse.json({ error: "La dungeon ya fue procesada" }, { status: 409 });

    // Otorgar XP a todos los participantes en paralelo
    const participantIds = dungeon.participants.map((p) => p.userId);
    const rewards = await Promise.all(
      participantIds.map((uid) => grantXP(uid, dungeon.xpBonus))
    );

    // Actualizar XP recibida en la tabla pivot y marcar como completada
    await prisma.$transaction([
      ...participantIds.map((uid) =>
        prisma.dungeonParticipant.updateMany({
          where: { dungeonId, userId: uid },
          data:  { xpReceived: dungeon.xpBonus },
        })
      ),
      prisma.dungeon.update({
        where: { id: dungeonId },
        data:  { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        dungeonId,
        participantsRewarded: participantIds.length,
        xpBonus:  dungeon.xpBonus,
        rewards,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
