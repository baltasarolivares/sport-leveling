import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { type User } from "@/app/generated/prisma/client";

export type AuthUser = {
  supabaseId: string;
  email: string;
  profile: User;
};

/**
 * Lee la sesión activa desde las cookies y devuelve el perfil completo
 * del usuario en la base de datos. Retorna null si no hay sesión o si
 * la sesión es "fantasma" (JWT válido pero sin fila en public.users).
 *
 * Si detecta una sesión fantasma (usuario borrado de la DB pero cookie viva),
 * automáticamente cierra la sesión para evitar errores 500 en cascada.
 *
 * Usar en Server Components, Server Actions y API Routes.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  });

  // Sesión fantasma: JWT válido pero la fila en public.users ya no existe
  // (usuario borrado del dashboard de Supabase, desincronización de trigger,
  // migración manual, etc.). Limpiamos la cookie para que el siguiente
  // request caiga por middleware hacia /login en lugar de crashear.
  if (!profile) {
    try { await supabase.auth.signOut(); } catch { /* noop */ }
    return null;
  }

  return {
    supabaseId: user.id,
    email: user.email ?? "",
    profile,
  };
}

/**
 * Igual que getAuthUser pero redirige a /login si no hay sesión válida.
 * Usar en rutas garantizadamente protegidas por el middleware.
 *
 * Nota: usa redirect() en lugar de throw para que sesiones fantasma
 * (usuario borrado con cookie viva) no produzcan errores 500.
 */
export async function requireAuthUser(): Promise<AuthUser> {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login?reason=session_expired");
  }
  return authUser;
}
