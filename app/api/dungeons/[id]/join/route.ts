import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

  const userId = user.id;

  try {
    const dungeon = await prisma.dungeon.findUnique({
      where:   { id: dungeonId },
      include: { participants: true },
    });

    if (!dungeon)
      return NextResponse.json({ error: "Dungeon no encontrada" }, { status: 404 });
    if (dungeon.status !== "OPEN")
      return NextResponse.json({ error: "La dungeon ya no está abierta" }, { status: 409 });
    if (dungeon.participants.length >= dungeon.maxParticipants)
      return NextResponse.json({ error: "La dungeon está llena" }, { status: 409 });

    const participant = await prisma.dungeonParticipant.create({
      data: { dungeonId, userId },
      include: { user: { select: { id: true, name: true, rank: true, hunterClass: true } } },
    });

    return NextResponse.json({ ok: true, data: participant });
  } catch (err: unknown) {
    if (
      typeof err === "object" && err !== null && "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Ya estás unido a esta dungeon" }, { status: 409 });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
