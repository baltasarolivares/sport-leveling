import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { type User } from "@/app/generated/prisma/client";

export type AuthUser = {
  supabaseId: string;
  email: string;
  profile: User;
};

/**
 * Lee la sesión activa desde las cookies y devuelve el perfil completo
 * del usuario en la base de datos. Retorna null si no hay sesión.
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

  if (!profile) return null;

  return {
    supabaseId: user.id,
    email: user.email ?? "",
    profile,
  };
}

/**
 * Igual que getAuthUser pero lanza un error si no hay sesión.
 * Usar en rutas garantizadamente protegidas por el middleware.
 */
export async function requireAuthUser(): Promise<AuthUser> {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error("No authenticated user — middleware should have redirected");
  }
  return authUser;
}
