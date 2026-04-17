import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components ("use client").
 * Gestiona la sesión en el navegador vía localStorage + cookies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
