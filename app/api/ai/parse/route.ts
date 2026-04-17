import { NextRequest, NextResponse } from "next/server";
import { parseActivityText } from "@/lib/gemini/parse-activity";

export async function POST(req: NextRequest) {
  let text: string;
  try {
    const body = await req.json();
    text = String(body?.text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json(
      { error: "El campo 'text' es requerido" },
      { status: 400 }
    );
  }

  if (text.length > 1000) {
    return NextResponse.json(
      { error: "Texto demasiado largo (máx 1000 caracteres)" },
      { status: 400 }
    );
  }

  try {
    const parsed = await parseActivityText(text);
    return NextResponse.json({ ok: true, data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
