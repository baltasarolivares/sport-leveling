import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase redirige aquí después de que el usuario confirma su email.
 * Intercambia el `code` PKCE por una sesión activa y redirige al destino.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` permite redirigir a rutas específicas tras el callback
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error o código ausente
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("El enlace de confirmación no es válido o ya expiró.")}`
  );
}
