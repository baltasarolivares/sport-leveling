import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { ActivityCategory } from "@/types";

// ── GET /api/dungeons — listar todas las dungeons con sus participantes ──────
export async function GET() {
  try {
    const dungeons = await prisma.dungeon.findMany({
      orderBy: { scheduledAt: "asc" },
      include: {
        creator: { select: { id: true, name: true, rank: true, hunterClass: true } },
        participants: {
          include: { user: { select: { id: true, name: true, rank: true, hunterClass: true } } },
        },
      },
    });
    return NextResponse.json({ ok: true, data: dungeons });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST /api/dungeons — crear una dungeon ───────────────────────────────────
export async function POST(req: NextRequest) {
  // Autenticación desde sesión
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: {
    title: string;
    description?: string;
    scheduledAt: string;
    category: ActivityCategory;
    xpBonus: number;
    maxParticipants: number;
  };

  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Body inválido" }, { status: 400 }); }

  const { title, scheduledAt, category, xpBonus, maxParticipants, description } = body;

  if (!title || !scheduledAt || !category) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const VALID: ActivityCategory[] = ["STRENGTH", "AGILITY", "INTELLIGENCE", "MIXED"];
  if (!VALID.includes(category)) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }

  try {
    const dungeon = await prisma.dungeon.create({
      data: {
        creatorId:       user.id,
        title:           title.slice(0, 80),
        description:     description?.slice(0, 200),
        scheduledAt:     new Date(scheduledAt),
        category,
        xpBonus:         Math.max(100, Math.min(50_000, Number(xpBonus) || 1000)),
        maxParticipants: Math.max(2,   Math.min(50,     Number(maxParticipants) || 10)),
      },
      include: {
        creator:      { select: { id: true, name: true, rank: true, hunterClass: true } },
        participants: { include: { user: { select: { id: true, name: true, rank: true, hunterClass: true } } } },
      },
    });
    return NextResponse.json({ ok: true, data: dungeon }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
