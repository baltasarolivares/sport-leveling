import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyActivity } from "@/lib/xp-engine";
import type { ActivityCategory } from "@/types";

export async function POST(req: NextRequest) {
  // ── Autenticación desde sesión ──────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // ── Body ────────────────────────────────────────────────────────
  let body: {
    rawText: string;
    title: string;
    category: ActivityCategory;
    durationMinutes: number;
    intensity: number;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { rawText, title, category, durationMinutes, intensity, notes } = body;

  if (!rawText || !title || !category) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: rawText, title, category" },
      { status: 400 }
    );
  }

  try {
    const result = await applyActivity({
      userId: user.id,
      rawText,
      title,
      notes,
      category,
      durationMinutes: Math.max(1, Number(durationMinutes) || 60),
      intensity:       Math.max(1, Math.min(10, Number(intensity) || 5)),
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[POST /api/activities]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
