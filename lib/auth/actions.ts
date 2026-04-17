"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

export async function login(formData: FormData) {
  const email    = (formData.get("email")    as string).trim();
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

export async function register(formData: FormData) {
  const name     = (formData.get("name")     as string).trim();
  const email    = (formData.get("email")    as string).trim();
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El trigger de Supabase lee raw_user_meta_data->>'name'
      data: { name },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  // Si hay sesión activa → confirmación de email desactivada en Supabase
  if (data.session) {
    redirect("/onboarding");
  }

  // Email de confirmación enviado
  redirect("/register?verify=1");
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
